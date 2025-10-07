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
exports.getChatRooms = void 0;
const chat_1 = require("../Models/chat");
const getChatRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.currentUser.id;
        // Get user's chat rooms
        const chatRooms = yield chat_1.ChatRoom.find({
            $or: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        })
            .populate([
            { path: 'user1Id', select: 'name profilePhoto nickname partnerNickname' },
            { path: 'user2Id', select: 'name profilePhoto nickname partnerNickname' },
            {
                path: 'lastMessage',
                select: 'content messageType createdAt senderId',
                populate: { path: 'senderId', select: 'name' }
            }
        ])
            .sort({ lastMessageTime: -1, createdAt: -1 });
        // Format response to show partner info and unread count
        const formattedChatRooms = chatRooms.map(room => {
            const isUser1 = room.user1Id.toString() === userId;
            const partner = isUser1 ? room.user2Id : room.user1Id;
            const unreadCount = isUser1 ? room.unreadCountUser1 : room.unreadCountUser2;
            return {
                _id: room._id,
                partner: {
                    _id: partner._id,
                    name: partner.name,
                    profilePhoto: partner.profilePhoto,
                    nickname: partner.nickname,
                    partnerNickname: partner.partnerNickname
                },
                lastMessage: room.lastMessage,
                lastMessageTime: room.lastMessageTime,
                unreadCount,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt
            };
        });
        res.status(200).json({
            success: true,
            data: formattedChatRooms
        });
    }
    catch (error) {
        console.error("Error getting chat rooms:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.getChatRooms = getChatRooms;
