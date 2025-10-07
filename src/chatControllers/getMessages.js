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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const chat_1 = require("../Models/chat");
const user_1 = require("../Models/user");
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { partnerId } = req.params;
        const userId = req.currentUser.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        // Check if partner exists and is actually partner
        const partner = yield user_1.User.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ message: "Partner not found" });
        }
        const user = yield user_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (((_a = user.partnerId) === null || _a === void 0 ? void 0 : _a.toString()) !== partnerId && ((_b = partner.partnerId) === null || _b === void 0 ? void 0 : _b.toString()) !== userId) {
            return res.status(403).json({ message: "You can only view messages with your partner" });
        }
        // Find chat room
        const chatRoom = yield chat_1.ChatRoom.findOne({
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
        const messages = yield chat_1.Message.find({ chatRoomId: chatRoom._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate([
            { path: 'senderId', select: 'name profilePhoto nickname' },
            { path: 'receiverId', select: 'name profilePhoto nickname' }
        ]);
        // Get total count
        const totalMessages = yield chat_1.Message.countDocuments({ chatRoomId: chatRoom._id });
        // Mark messages as read if they are received by current user
        const unreadMessages = messages.filter(msg => msg.receiverId.toString() === userId && !msg.isRead);
        if (unreadMessages.length > 0) {
            yield chat_1.Message.updateMany({ _id: { $in: unreadMessages.map(msg => msg._id) } }, { isRead: true });
        }
        // Update unread count in chat room
        if (chatRoom.user1Id.toString() === userId) {
            chatRoom.unreadCountUser1 = 0;
        }
        else {
            chatRoom.unreadCountUser2 = 0;
        }
        yield chatRoom.save();
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
    }
    catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.getMessages = getMessages;
