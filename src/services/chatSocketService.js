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
exports.ChatSocketService = void 0;
const socket_io_1 = require("socket.io");
const chat_1 = require("../Models/chat");
const onlineStatus_1 = require("../Models/onlineStatus");
const user_1 = require("../Models/user");
const expoNotificationService_1 = require("./expoNotificationService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class ChatSocketService {
    constructor(server) {
        this.connectedUsers = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        this.io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("🔍 Socket authentication attempt for socket ID:", socket.id);
                const token = socket.handshake.auth.token;
                if (!token) {
                    console.log("❌ Token not found in socket handshake");
                    return next(new Error("Authentication error - No token provided"));
                }
                console.log("🔑 Token found, verifying...");
                const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
                console.log("✅ Token verified, user ID:", decoded.id);
                const user = yield user_1.User.findById(decoded.id);
                if (!user) {
                    console.log("❌ User not found in database for ID:", decoded.id);
                    return next(new Error("User not found"));
                }
                console.log("✅ User authenticated successfully:", user.name);
                socket.data.userId = decoded.id;
                next();
            }
            catch (error) {
                console.error("❌ Socket authentication error:", error);
                next(new Error("Authentication error"));
            }
        }));
    }
    setupEventHandlers() {
        this.io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("🔌 New socket connection, socket ID:", socket.id);
                const userId = socket.data.userId;
                console.log(`✅ User ${userId} connected successfully`);
                // Store connected user
                this.connectedUsers.set(userId, {
                    userId,
                    socketId: socket.id
                });
                console.log("📝 Connected user stored, total connected users:", this.connectedUsers.size);
                // Update online status
                yield this.updateUserOnlineStatus(userId, true, socket.id);
                console.log("🟢 Online status updated for user:", userId);
                // Join user to their personal room
                socket.join(`user:${userId}`);
                console.log("🏠 User joined personal room:", `user:${userId}`);
                // Get user's partner and join partner's room
                const user = yield user_1.User.findById(userId);
                if (user === null || user === void 0 ? void 0 : user.partnerId) {
                    socket.join(`user:${user.partnerId}`);
                    console.log("👥 User joined partner's room:", `user:${user.partnerId}`);
                    // Notify partner that user is online
                    this.io.to(`user:${user.partnerId}`).emit("partner_online", {
                        userId,
                        isOnline: true
                    });
                    console.log("📢 Partner notified about online status");
                }
                else {
                    console.log("⚠️ User has no partner assigned");
                }
            }
            catch (error) {
                console.error("❌ Error in socket connection setup:", error);
            }
            // Handle new message
            socket.on("send_message", (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const maxRetries = 3;
                let retryCount = 0;
                while (retryCount < maxRetries) {
                    try {
                        const userId = socket.data.userId;
                        console.log("📨 Message send request from user:", userId, "attempt:", retryCount + 1);
                        const { receiverId, content, messageType = "text", mediaUrl } = data;
                        console.log("📝 Message data:", { receiverId, content, messageType, mediaUrl });
                        // Validate that receiver is partner
                        const receiver = yield user_1.User.findById(receiverId);
                        if (!receiver) {
                            console.log("❌ Receiver not found:", receiverId);
                            socket.emit("error", { message: "Receiver not found" });
                            return;
                        }
                        if (((_a = receiver.partnerId) === null || _a === void 0 ? void 0 : _a.toString()) !== userId) {
                            console.log("❌ Invalid receiver - not partner:", receiverId);
                            socket.emit("error", { message: "Invalid receiver - not your partner" });
                            return;
                        }
                        console.log("✅ Receiver validation passed");
                        // Find or create chat room
                        let chatRoom = yield chat_1.ChatRoom.findOne({
                            $or: [
                                { user1Id: userId, user2Id: receiverId },
                                { user1Id: receiverId, user2Id: userId }
                            ]
                        });
                        if (!chatRoom) {
                            console.log("🏠 Creating new chat room for users:", userId, receiverId);
                            const newChatRoom = chat_1.ChatRoom.build({
                                user1Id: userId,
                                user2Id: receiverId,
                                unreadCountUser1: 0,
                                unreadCountUser2: 0
                            });
                            yield newChatRoom.save();
                            chatRoom = newChatRoom;
                            console.log("✅ New chat room created:", chatRoom._id);
                        }
                        else {
                            console.log("🏠 Existing chat room found:", chatRoom._id);
                        }
                        // Create message
                        const message = chat_1.Message.build({
                            senderId: userId,
                            receiverId: receiverId,
                            content,
                            messageType,
                            mediaUrl,
                            isRead: false,
                            chatRoomId: chatRoom._id
                        });
                        yield message.save();
                        console.log("✅ Message saved:", message._id);
                        // Update chat room
                        if (chatRoom) {
                            chatRoom.lastMessage = message._id;
                            chatRoom.lastMessageTime = new Date();
                            if (chatRoom.user1Id.toString() === receiverId) {
                                chatRoom.unreadCountUser1 += 1;
                                console.log("📊 Updated unread count for user1");
                            }
                            else {
                                chatRoom.unreadCountUser2 += 1;
                                console.log("📊 Updated unread count for user2");
                            }
                            yield chatRoom.save();
                            console.log("✅ Chat room updated");
                        }
                        // Populate sender info
                        yield message.populate([
                            { path: 'senderId', select: 'name profilePhoto nickname' },
                            { path: 'receiverId', select: 'name profilePhoto nickname' }
                        ]);
                        console.log("✅ Message populated with user info");
                        // Send push notification to receiver if they have expo push token
                        try {
                            const receiver = yield user_1.User.findById(receiverId);
                            if (receiver && receiver.expoPushToken) {
                                const sender = yield user_1.User.findById(userId);
                                const senderName = (sender === null || sender === void 0 ? void 0 : sender.nickname) || (sender === null || sender === void 0 ? void 0 : sender.name) || 'Partner';
                                yield expoNotificationService_1.expoNotificationService.sendChatNotification(receiver.expoPushToken, senderName, content, chatRoom._id.toString());
                                console.log("📱 Push notification sent for socket message");
                            }
                        }
                        catch (notificationError) {
                            console.error("❌ Error sending push notification via socket:", notificationError);
                            // Don't fail the message sending if notification fails
                        }
                        // Emit to receiver
                        this.io.to(`user:${receiverId}`).emit("new_message", {
                            message,
                            chatRoomId: chatRoom._id
                        });
                        console.log("📤 Message emitted to receiver:", receiverId);
                        // Emit to sender (confirmation)
                        socket.emit("message_sent", {
                            message,
                            chatRoomId: chatRoom._id
                        });
                        console.log("✅ Message sent confirmation to sender");
                        return; // Success, exit retry loop
                    }
                    catch (error) {
                        retryCount++;
                        console.error(`❌ Error sending message via socket (attempt ${retryCount}/${maxRetries}):`, error);
                        if (retryCount >= maxRetries) {
                            console.error("❌ Max retries reached for message sending");
                            socket.emit("error", { message: "Failed to send message after retries" });
                            return;
                        }
                        // Wait before retry
                        yield new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            }));
            // Handle typing indicator
            socket.on("typing_start", (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const userId = socket.data.userId;
                    const { receiverId } = data;
                    console.log("⌨️ Typing start from user:", userId, "to:", receiverId);
                    const user = yield user_1.User.findById(userId);
                    if (((_a = user === null || user === void 0 ? void 0 : user.partnerId) === null || _a === void 0 ? void 0 : _a.toString()) === receiverId) {
                        this.io.to(`user:${receiverId}`).emit("partner_typing", {
                            userId,
                            isTyping: true
                        });
                        console.log("📢 Typing indicator sent to partner");
                    }
                    else {
                        console.log("❌ Invalid typing request - not partner");
                    }
                }
                catch (error) {
                    console.error("❌ Error in typing_start:", error);
                }
            }));
            socket.on("typing_stop", (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const userId = socket.data.userId;
                    const { receiverId } = data;
                    console.log("⏹️ Typing stop from user:", userId, "to:", receiverId);
                    const user = yield user_1.User.findById(userId);
                    if (((_a = user === null || user === void 0 ? void 0 : user.partnerId) === null || _a === void 0 ? void 0 : _a.toString()) === receiverId) {
                        this.io.to(`user:${receiverId}`).emit("partner_typing", {
                            userId,
                            isTyping: false
                        });
                        console.log("📢 Typing stop indicator sent to partner");
                    }
                    else {
                        console.log("❌ Invalid typing stop request - not partner");
                    }
                }
                catch (error) {
                    console.error("❌ Error in typing_stop:", error);
                }
            }));
            // Handle message read
            socket.on("mark_as_read", (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const userId = socket.data.userId;
                    const { messageIds, chatRoomId } = data;
                    console.log("📖 Mark as read request from user:", userId, "messages:", messageIds);
                    // Mark messages as read
                    yield chat_1.Message.updateMany({ _id: { $in: messageIds } }, { isRead: true });
                    console.log("✅ Messages marked as read");
                    // Update chat room unread count
                    const chatRoom = yield chat_1.ChatRoom.findById(chatRoomId);
                    if (chatRoom) {
                        if (chatRoom.user1Id.toString() === userId) {
                            chatRoom.unreadCountUser1 = 0;
                            console.log("📊 Reset unread count for user1");
                        }
                        else {
                            chatRoom.unreadCountUser2 = 0;
                            console.log("📊 Reset unread count for user2");
                        }
                        yield chatRoom.save();
                        console.log("✅ Chat room unread count updated");
                    }
                    else {
                        console.log("❌ Chat room not found for mark as read");
                    }
                    // Notify partner
                    if (chatRoom) {
                        const partnerId = chatRoom.user1Id.toString() === userId
                            ? chatRoom.user2Id
                            : chatRoom.user1Id;
                        if (partnerId) {
                            this.io.to(`user:${partnerId}`).emit("messages_read", {
                                messageIds,
                                chatRoomId
                            });
                            console.log("📢 Partner notified about read messages");
                        }
                    }
                }
                catch (error) {
                    console.error("❌ Error marking messages as read:", error);
                }
            }));
            // Handle disconnect
            socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const userId = socket.data.userId;
                    console.log(`🔌 User ${userId} disconnected`);
                    // Remove from connected users
                    this.connectedUsers.delete(userId);
                    console.log("📝 User removed from connected users, total:", this.connectedUsers.size);
                    // Update online status
                    yield this.updateUserOnlineStatus(userId, false);
                    console.log("🔴 Online status updated to offline for user:", userId);
                    // Notify partner
                    const user = yield user_1.User.findById(userId);
                    if (user === null || user === void 0 ? void 0 : user.partnerId) {
                        this.io.to(`user:${user.partnerId}`).emit("partner_online", {
                            userId,
                            isOnline: false
                        });
                        console.log("📢 Partner notified about offline status");
                    }
                    else {
                        console.log("⚠️ User has no partner to notify");
                    }
                }
                catch (error) {
                    console.error("❌ Error in disconnect handler:", error);
                }
            }));
        }));
    }
    updateUserOnlineStatus(userId, isOnline, socketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxRetries = 3;
            let retryCount = 0;
            while (retryCount < maxRetries) {
                try {
                    console.log("🔄 Updating online status for user:", userId, "isOnline:", isOnline, "attempt:", retryCount + 1);
                    let onlineStatus = yield onlineStatus_1.OnlineStatus.findOne({ userId }).maxTimeMS(5000);
                    if (!onlineStatus) {
                        console.log("📝 Creating new online status record for user:", userId);
                        onlineStatus = onlineStatus_1.OnlineStatus.build({
                            userId: userId,
                            isOnline,
                            lastSeen: new Date(),
                            socketId
                        });
                    }
                    else {
                        console.log("📝 Updating existing online status for user:", userId);
                        onlineStatus.isOnline = isOnline;
                        onlineStatus.lastSeen = new Date();
                        if (socketId) {
                            onlineStatus.socketId = socketId;
                        }
                    }
                    yield onlineStatus.save();
                    console.log("✅ Online status updated successfully for user:", userId);
                    return; // Success, exit retry loop
                }
                catch (error) {
                    retryCount++;
                    console.error(`❌ Error updating online status (attempt ${retryCount}/${maxRetries}):`, error);
                    if (retryCount >= maxRetries) {
                        console.error("❌ Max retries reached for online status update");
                        return;
                    }
                    // Wait before retry
                    yield new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }
        });
    }
    // Public method to emit events from other parts of the application
    emitToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    emitToPartner(userId, event, data) {
        user_1.User.findById(userId).then(user => {
            if (user === null || user === void 0 ? void 0 : user.partnerId) {
                this.io.to(`user:${user.partnerId}`).emit(event, data);
            }
        });
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
}
exports.ChatSocketService = ChatSocketService;
