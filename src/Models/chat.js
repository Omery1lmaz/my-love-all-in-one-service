"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoom = exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Message Schema
const messageSchema = new mongoose_1.default.Schema({
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    messageType: {
        type: String,
        enum: ["text", "image", "audio", "video", "file"],
        default: "text",
    },
    mediaUrl: {
        type: String,
        required: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    chatRoomId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true,
    },
}, { timestamps: true });
// ChatRoom Schema
const chatRoomSchema = new mongoose_1.default.Schema({
    user1Id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    user2Id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lastMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    lastMessageTime: {
        type: Date,
    },
    unreadCountUser1: {
        type: Number,
        default: 0,
    },
    unreadCountUser2: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
// Indexes for better performance
messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
chatRoomSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
// Static methods
messageSchema.statics.build = (attrs) => {
    return new Message(attrs);
};
chatRoomSchema.statics.build = (attrs) => {
    return new ChatRoom(attrs);
};
// Create models
const Message = mongoose_1.default.model("Message", messageSchema);
exports.Message = Message;
const ChatRoom = mongoose_1.default.model("ChatRoom", chatRoomSchema);
exports.ChatRoom = ChatRoom;
