"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const chat_1 = require("../Models/chat");
const user_1 = require("../Models/user");
const expoNotificationService_1 = require("../services/expoNotificationService");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { receiverId, content, messageType = "text", mediaUrl } = req.body;
        const senderId = req.currentUser.id;
        // Check if receiver exists and is partner
        const receiver = yield user_1.User.findById(receiverId);
        if (!receiver) {
            res.status(404).json({ message: "Receiver not found" });
            return;
        }
        // Check if sender and receiver are partners
        const sender = yield user_1.User.findById(senderId);
        if (!sender) {
            res.status(404).json({ message: "Sender not found" });
            return;
        }
        if (((_a = sender.partnerId) === null || _a === void 0 ? void 0 : _a.toString()) !== receiverId && ((_b = receiver.partnerId) === null || _b === void 0 ? void 0 : _b.toString()) !== senderId) {
            res.status(403).json({ message: "You can only send messages to your partner" });
            return;
        }
        // Ensure sender has a subscription (create default if not exists)
        console.log(`Ensuring subscription exists for message sending - user: ${senderId}`);
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(senderId));
            console.log(`Subscription verified/created for message sending - user: ${senderId}`, {
                subscriptionId: userSubscription._id,
                planType: userSubscription.planType,
                isActive: userSubscription.isActive
            });
            // Double check that subscription is active
            if (!userSubscription.isActive) {
                console.warn(`Subscription found but inactive for user: ${senderId}, activating...`);
                userSubscription.isActive = true;
                yield userSubscription.save();
                console.log(`Subscription activated for user: ${senderId}`);
            }
        }
        catch (error) {
            console.error(`Error with subscription for message sending - user ${senderId}:`, error);
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can send more messages (basic check)
        const existingMessages = yield chat_1.Message.countDocuments({ senderId: senderId });
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
        let chatRoom = yield chat_1.ChatRoom.findOne({
            $or: [
                { user1Id: senderId, user2Id: receiverId },
                { user1Id: receiverId, user2Id: senderId }
            ]
        });
        if (!chatRoom) {
            const newChatRoom = chat_1.ChatRoom.build({
                user1Id: senderId,
                user2Id: receiverId,
                unreadCountUser1: 0,
                unreadCountUser2: 0
            });
            yield newChatRoom.save();
            chatRoom = newChatRoom;
        }
        // Create message
        const message = chat_1.Message.build({
            senderId: senderId,
            receiverId: receiverId,
            content,
            messageType,
            mediaUrl,
            isRead: false,
            chatRoomId: chatRoom._id
        });
        console.log(`Saving message for user: ${senderId}`);
        yield message.save();
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
            }
            else {
                chatRoom.unreadCountUser2 += 1;
            }
            yield chatRoom.save();
        }
        // Populate sender and receiver info
        yield message.populate([
            { path: 'senderId', select: 'name profilePhoto nickname' },
            { path: 'receiverId', select: 'name profilePhoto nickname' }
        ]);
        // Send push notification to receiver if they have expo push token
        if (receiver.expoPushToken) {
            try {
                const senderName = sender.nickname || sender.name || 'Partner';
                yield expoNotificationService_1.expoNotificationService.sendChatNotification(receiver.expoPushToken, senderName, content, chatRoom._id.toString());
                console.log('Push notification sent for chat message');
            }
            catch (notificationError) {
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
    }
    catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.sendMessage = sendMessage;
