import mongoose from "mongoose";

// Message Interface
interface MessageAttrs {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "audio" | "video" | "file";
  mediaUrl?: string;
  isRead: boolean;
  chatRoomId: mongoose.Schema.Types.ObjectId;
}

interface MessageDoc extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "audio" | "video" | "file";
  mediaUrl?: string;
  isRead: boolean;
  chatRoomId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageModel extends mongoose.Model<MessageDoc> {
  build(attrs: MessageAttrs): MessageDoc;
}

// ChatRoom Interface
interface ChatRoomAttrs {
  user1Id: mongoose.Schema.Types.ObjectId;
  user2Id: mongoose.Schema.Types.ObjectId;
  lastMessage?: mongoose.Schema.Types.ObjectId;
  lastMessageTime?: Date;
  unreadCountUser1?: number;
  unreadCountUser2?: number;
}

interface ChatRoomDoc extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  user1Id: mongoose.Schema.Types.ObjectId;
  user2Id: mongoose.Schema.Types.ObjectId;
  lastMessage?: mongoose.Schema.Types.ObjectId;
  lastMessageTime?: Date;
  unreadCountUser1: number;
  unreadCountUser2: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatRoomModel extends mongoose.Model<ChatRoomDoc> {
  build(attrs: ChatRoomAttrs): ChatRoomDoc;
}

// Message Schema
const messageSchema = new mongoose.Schema<MessageDoc>(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
  },
  { timestamps: true }
);

// ChatRoom Schema
const chatRoomSchema = new mongoose.Schema<ChatRoomDoc>(
  {
    user1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

// Indexes for better performance
messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
chatRoomSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

// Static methods
messageSchema.statics.build = (attrs: MessageAttrs) => {
  return new Message(attrs);
};

chatRoomSchema.statics.build = (attrs: ChatRoomAttrs) => {
  return new ChatRoom(attrs);
};

// Create models
const Message = mongoose.model<MessageDoc, MessageModel>("Message", messageSchema);
const ChatRoom = mongoose.model<ChatRoomDoc, ChatRoomModel>("ChatRoom", chatRoomSchema);

export { Message, ChatRoom, MessageAttrs, ChatRoomAttrs }; 