import { Request, Response } from "express";
import { Message, ChatRoom } from "../Models/chat";
import { User } from "../Models/user";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const userId = req.currentUser!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if partner exists and is actually partner
    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.partnerId?.toString() !== partnerId && partner.partnerId?.toString() !== userId) {
      return res.status(403).json({ message: "You can only view messages with your partner" });
    }

    // Find chat room
    const chatRoom = await ChatRoom.findOne({
      $or: [
        { user1Id: userId, user2Id: partnerId },
        { user1Id: partnerId, user2Id: userId }
      ]
    });

    if (!chatRoom) {
      return res.status(200).json({
        success: true,
        data: {
          messages: [],
          totalMessages: 0,
          hasMore: false
        }
      });
    }

    // Get messages
    const messages = await Message.find({ chatRoomId: chatRoom._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: 'senderId', select: 'name profilePhoto nickname' },
        { path: 'receiverId', select: 'name profilePhoto nickname' }
      ]);

    // Get total count
    const totalMessages = await Message.countDocuments({ chatRoomId: chatRoom._id });

    // Mark messages as read if they are received by current user
    const unreadMessages = messages.filter(
      msg => msg.receiverId.toString() === userId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessages.map(msg => msg._id) } },
        { isRead: true }
      );
    }

    // Update unread count in chat room
    if (chatRoom.user1Id.toString() === userId) {
      chatRoom.unreadCountUser1 = 0;
    } else {
      chatRoom.unreadCountUser2 = 0;
    }
    await chatRoom.save();

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to get chronological order
        totalMessages,
        hasMore: skip + limit < totalMessages,
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit)
      }
    });

  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}; 