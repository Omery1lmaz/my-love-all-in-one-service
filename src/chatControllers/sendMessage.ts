import { Request, Response } from "express";
import { Message, ChatRoom } from "../Models/chat";
import { User } from "../Models/user";
import { OnlineStatus } from "../Models/onlineStatus";
import { expoNotificationService } from "../services/expoNotificationService";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content, messageType = "text", mediaUrl } = req.body;
    const senderId = req.currentUser!.id;

    // Check if receiver exists and is partner
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({ message: "Receiver not found" });
      return
    }

    // Check if sender and receiver are partners
    const sender = await User.findById(senderId);
    if (!sender) {
      res.status(404).json({ message: "Sender not found" });
      return
    }

    if (sender.partnerId?.toString() !== receiverId && receiver.partnerId?.toString() !== senderId) {
      res.status(403).json({ message: "You can only send messages to your partner" });
      return
    }

    // Ensure sender has a subscription (create default if not exists)
    console.log(`Ensuring subscription exists for message sending - user: ${senderId}`);
    let userSubscription;
    try {
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(senderId)
      );
      console.log(`Subscription verified/created for message sending - user: ${senderId}`, {
        subscriptionId: userSubscription._id,
        planType: userSubscription.planType,
        isActive: userSubscription.isActive
      });
      
      // Double check that subscription is active
      if (!userSubscription.isActive) {
        console.warn(`Subscription found but inactive for user: ${senderId}, activating...`);
        userSubscription.isActive = true;
        await userSubscription.save();
        console.log(`Subscription activated for user: ${senderId}`);
      }
    } catch (error) {
      console.error(`Error with subscription for message sending - user ${senderId}:`, error);
      res.status(400).json({ message: "Subscription doğrulanamadı" });
      return;
    }

    // Check if user can send more messages (basic check)
    const existingMessages = await Message.countDocuments({ senderId: senderId });
    console.log(`Message count check for user: ${senderId}`, {
      existingMessages,
      planType: userSubscription.planType
    });

    // Basic message limit check (can be enhanced based on plan)
    const maxMessages = userSubscription.planType === 'free' ? 100 : 
                       userSubscription.planType === 'premium' ? 1000 : 10000;
    
    if (existingMessages >= maxMessages) {
      console.error(`Message limit exceeded for user: ${senderId}`, {
        existingMessages,
        maxMessages,
        planType: userSubscription.planType
      });
      res.status(400).json({ 
        message: `Mesaj limiti aşıldı. Mevcut planınızla ${maxMessages} mesaj gönderebilirsiniz.` 
      });
      return;
    }

    console.log(`Message sending allowed for user: ${senderId}`, {
      existingMessages,
      maxMessages,
      planType: userSubscription.planType
    });

    // Find or create chat room
    let chatRoom = await ChatRoom.findOne({
      $or: [
        { user1Id: senderId, user2Id: receiverId },
        { user1Id: receiverId, user2Id: senderId }
      ]
    });

    if (!chatRoom) {
      const newChatRoom = ChatRoom.build({
        user1Id: senderId as any,
        user2Id: receiverId as any,
        unreadCountUser1: 0,
        unreadCountUser2: 0
      }) as any;
      await newChatRoom.save();
      chatRoom = newChatRoom;
    }

    // Create message
    const message = Message.build({
      senderId: senderId as any,
      receiverId: receiverId as any,
      content,
      messageType,
      mediaUrl,
      isRead: false,
      chatRoomId: chatRoom!._id
    });

    console.log(`Saving message for user: ${senderId}`);
    await message.save();

    console.log(`Message sent successfully for user: ${senderId}`, {
      messageId: message._id,
      messageType: message.messageType,
      planType: userSubscription.planType,
      remainingMessages: maxMessages - (existingMessages + 1)
    });

    // Update chat room with last message
    if (chatRoom) {
      chatRoom.lastMessage = message._id;
      chatRoom.lastMessageTime = new Date();

      // Update unread count for receiver
      if (chatRoom.user1Id.toString() === receiverId) {
        chatRoom.unreadCountUser1 += 1;
      } else {
        chatRoom.unreadCountUser2 += 1;
      }

      await chatRoom.save();

    }

    // Populate sender and receiver info
    await message.populate([
      { path: 'senderId', select: 'name profilePhoto nickname' },
      { path: 'receiverId', select: 'name profilePhoto nickname' }
    ]);

    // Send push notification to receiver if they have expo push token
    if (receiver.expoPushToken) {
      try {
        const senderName = sender.nickname || sender.name || 'Partner';
        await expoNotificationService.sendChatNotification(
          receiver.expoPushToken,
          senderName,
          content,
          chatRoom!._id.toString()
        );
        console.log('Push notification sent for chat message');
      } catch (notificationError) {
        console.error('Error sending push notification:', notificationError);
        // Don't fail the message sending if notification fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
      subscriptionInfo: {
        planType: userSubscription.planType,
        remainingMessages: maxMessages - (existingMessages + 1),
        maxMessages: maxMessages
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}; 