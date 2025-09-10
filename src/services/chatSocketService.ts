import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Message, ChatRoom } from "../Models/chat";
import { OnlineStatus } from "../Models/onlineStatus";
import { User } from "../Models/user";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket {
  userId: string;
  socketId: string;
}

export class ChatSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        console.log("🔍 Socket authentication attempt for socket ID:", socket.id);
        const token = socket.handshake.auth.token;

        if (!token) {
          console.log("❌ Token not found in socket handshake");
          return next(new Error("Authentication error - No token provided"));
        }

        console.log("🔑 Token found, verifying...");
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any;
        console.log("✅ Token verified, user ID:", decoded.id);

        const user = await User.findById(decoded.id);
        if (!user) {
          console.log("❌ User not found in database for ID:", decoded.id);
          return next(new Error("User not found"));
        }

        console.log("✅ User authenticated successfully:", user.name);
        socket.data.userId = decoded.id;
        next();
      } catch (error) {
        console.error("❌ Socket authentication error:", error);
        next(new Error("Authentication error"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", async (socket) => {
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
        await this.updateUserOnlineStatus(userId, true, socket.id);
        console.log("🟢 Online status updated for user:", userId);

        // Join user to their personal room
        socket.join(`user:${userId}`);
        console.log("🏠 User joined personal room:", `user:${userId}`);

        // Get user's partner and join partner's room
        const user = await User.findById(userId);
        if (user?.partnerId) {
          socket.join(`user:${user.partnerId}`);
          console.log("👥 User joined partner's room:", `user:${user.partnerId}`);

          // Notify partner that user is online
          this.io.to(`user:${user.partnerId}`).emit("partner_online", {
            userId,
            isOnline: true
          });
          console.log("📢 Partner notified about online status");
        } else {
          console.log("⚠️ User has no partner assigned");
        }
      } catch (error) {
        console.error("❌ Error in socket connection setup:", error);
      }

      // Handle new message
      socket.on("send_message", async (data) => {
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
          try {
            const userId = socket.data.userId;
            console.log("📨 Message send request from user:", userId, "attempt:", retryCount + 1);
            const { receiverId, content, messageType = "text", mediaUrl } = data;
            console.log("📝 Message data:", { receiverId, content, messageType, mediaUrl });
            // Validate that receiver is partner
            const receiver = await User.findById(receiverId)
            if (!receiver) {
              console.log("❌ Receiver not found:", receiverId);
              socket.emit("error", { message: "Receiver not found" });
              return;
            }

            if (receiver.partnerId?.toString() !== userId) {
              console.log("❌ Invalid receiver - not partner:", receiverId);
              socket.emit("error", { message: "Invalid receiver - not your partner" });
              return;
            }

            console.log("✅ Receiver validation passed");

            // Find or create chat room
            let chatRoom = await ChatRoom.findOne({
              $or: [
                { user1Id: userId, user2Id: receiverId },
                { user1Id: receiverId, user2Id: userId }
              ]
            })

            if (!chatRoom) {
              console.log("🏠 Creating new chat room for users:", userId, receiverId);
              const newChatRoom = ChatRoom.build({
                user1Id: userId as any,
                user2Id: receiverId as any,
                unreadCountUser1: 0,
                unreadCountUser2: 0
              }) as any;
              await newChatRoom.save();
              chatRoom = newChatRoom;
              console.log("✅ New chat room created:", chatRoom!._id);
            } else {
              console.log("🏠 Existing chat room found:", chatRoom._id);
            }

            // Create message
            const message = Message.build({
              senderId: userId as any,
              receiverId: receiverId as any,
              content,
              messageType,
              mediaUrl,
              isRead: false,
              chatRoomId: chatRoom!._id
            });

            await message.save();
            console.log("✅ Message saved:", message._id);

            // Update chat room
            if (chatRoom) {
              chatRoom.lastMessage = message._id;
              chatRoom.lastMessageTime = new Date();

              if (chatRoom.user1Id.toString() === receiverId) {
                chatRoom.unreadCountUser1 += 1;
                console.log("📊 Updated unread count for user1");
              } else {
                chatRoom.unreadCountUser2 += 1;
                console.log("📊 Updated unread count for user2");
              }

              await chatRoom.save();
              console.log("✅ Chat room updated");
            }

            // Populate sender info
            await message.populate([
              { path: 'senderId', select: 'name profilePhoto nickname' },
              { path: 'receiverId', select: 'name profilePhoto nickname' }
            ]);
            console.log("✅ Message populated with user info");

            // Emit to receiver
            this.io.to(`user:${receiverId}`).emit("new_message", {
              message,
              chatRoomId: chatRoom!._id
            });
            console.log("📤 Message emitted to receiver:", receiverId);

            // Emit to sender (confirmation)
            socket.emit("message_sent", {
              message,
              chatRoomId: chatRoom!._id
            });
            console.log("✅ Message sent confirmation to sender");

            return; // Success, exit retry loop
          } catch (error) {
            retryCount++;
            console.error(`❌ Error sending message via socket (attempt ${retryCount}/${maxRetries}):`, error);

            if (retryCount >= maxRetries) {
              console.error("❌ Max retries reached for message sending");
              socket.emit("error", { message: "Failed to send message after retries" });
              return;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      });

      // Handle typing indicator
      socket.on("typing_start", async (data) => {
        try {
          const userId = socket.data.userId;
          const { receiverId } = data;
          console.log("⌨️ Typing start from user:", userId, "to:", receiverId);

          const user = await User.findById(userId);
          if (user?.partnerId?.toString() === receiverId) {
            this.io.to(`user:${receiverId}`).emit("partner_typing", {
              userId,
              isTyping: true
            });
            console.log("📢 Typing indicator sent to partner");
          } else {
            console.log("❌ Invalid typing request - not partner");
          }
        } catch (error) {
          console.error("❌ Error in typing_start:", error);
        }
      });

      socket.on("typing_stop", async (data) => {
        try {
          const userId = socket.data.userId;
          const { receiverId } = data;
          console.log("⏹️ Typing stop from user:", userId, "to:", receiverId);

          const user = await User.findById(userId);
          if (user?.partnerId?.toString() === receiverId) {
            this.io.to(`user:${receiverId}`).emit("partner_typing", {
              userId,
              isTyping: false
            });
            console.log("📢 Typing stop indicator sent to partner");
          } else {
            console.log("❌ Invalid typing stop request - not partner");
          }
        } catch (error) {
          console.error("❌ Error in typing_stop:", error);
        }
      });

      // Handle message read
      socket.on("mark_as_read", async (data) => {
        try {
          const userId = socket.data.userId;
          const { messageIds, chatRoomId } = data;
          console.log("📖 Mark as read request from user:", userId, "messages:", messageIds);

          // Mark messages as read
          await Message.updateMany(
            { _id: { $in: messageIds } },
            { isRead: true }
          );
          console.log("✅ Messages marked as read");

          // Update chat room unread count
          const chatRoom = await ChatRoom.findById(chatRoomId);
          if (chatRoom) {
            if (chatRoom.user1Id.toString() === userId) {
              chatRoom.unreadCountUser1 = 0;
              console.log("📊 Reset unread count for user1");
            } else {
              chatRoom.unreadCountUser2 = 0;
              console.log("📊 Reset unread count for user2");
            }
            await chatRoom.save();
            console.log("✅ Chat room unread count updated");
          } else {
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

        } catch (error) {
          console.error("❌ Error marking messages as read:", error);
        }
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        try {
          const userId = socket.data.userId;
          console.log(`🔌 User ${userId} disconnected`);

          // Remove from connected users
          this.connectedUsers.delete(userId);
          console.log("📝 User removed from connected users, total:", this.connectedUsers.size);

          // Update online status
          await this.updateUserOnlineStatus(userId, false);
          console.log("🔴 Online status updated to offline for user:", userId);

          // Notify partner
          const user = await User.findById(userId);
          if (user?.partnerId) {
            this.io.to(`user:${user.partnerId}`).emit("partner_online", {
              userId,
              isOnline: false
            });
            console.log("📢 Partner notified about offline status");
          } else {
            console.log("⚠️ User has no partner to notify");
          }
        } catch (error) {
          console.error("❌ Error in disconnect handler:", error);
        }
      });
    });
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean, socketId?: string) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log("🔄 Updating online status for user:", userId, "isOnline:", isOnline, "attempt:", retryCount + 1);

        let onlineStatus = await OnlineStatus.findOne({ userId }).maxTimeMS(5000);

        if (!onlineStatus) {
          console.log("📝 Creating new online status record for user:", userId);
          onlineStatus = OnlineStatus.build({
            userId: userId as any,
            isOnline,
            lastSeen: new Date(),
            socketId
          }) as any;
        } else {
          console.log("📝 Updating existing online status for user:", userId);
          onlineStatus.isOnline = isOnline;
          onlineStatus.lastSeen = new Date();
          if (socketId) {
            onlineStatus.socketId = socketId;
          }
        }

        await onlineStatus!.save();
        console.log("✅ Online status updated successfully for user:", userId);
        return; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(`❌ Error updating online status (attempt ${retryCount}/${maxRetries}):`, error);

        if (retryCount >= maxRetries) {
          console.error("❌ Max retries reached for online status update");
          return;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  // Public method to emit events from other parts of the application
  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToPartner(userId: string, event: string, data: any) {
    User.findById(userId).then(user => {
      if (user?.partnerId) {
        this.io.to(`user:${user.partnerId}`).emit(event, data);
      }
    });
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
} 