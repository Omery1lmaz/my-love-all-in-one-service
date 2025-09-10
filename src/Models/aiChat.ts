import mongoose from "mongoose";

interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatSession {
  userId: mongoose.Schema.Types.ObjectId;
  sessionId: string;
  title: string;
  messages: AIChatMessage[];
  isActive: boolean;
  coachType?: string; // Yaşam koçu türü
  coachId?: string; // Koç ID'si
}

interface AIChatSessionDoc extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  sessionId: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  coachType?: string;
  coachId?: string;
}

interface AIChatSessionModel extends mongoose.Model<AIChatSessionDoc> {
  build(attrs: AIChatSession): AIChatSessionDoc;
}

const aiChatMessageSchema = new mongoose.Schema<AIChatMessage>({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const aiChatSessionSchema = new mongoose.Schema<AIChatSessionDoc>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      default: "Yeni Sohbet",
    },
    messages: [aiChatMessageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    coachType: {
      type: String,
      enum: ["general", "relationship_coach", "career_coach", "health_coach", "personal_development_coach", "financial_coach"],
      default: "general",
    },
    coachId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Session ID oluşturma için index
aiChatSessionSchema.index({ userId: 1, sessionId: 1 });

// Kullanıcının aktif sohbetlerini bulma
aiChatSessionSchema.statics.findActiveSessionsByUser = function(userId: string) {
  return this.find({ userId, isActive: true }).sort({ updatedAt: -1 });
};

// Belirli bir session'ı bulma
aiChatSessionSchema.statics.findSessionById = function(sessionId: string, userId: string) {
  return this.findOne({ sessionId, userId, isActive: true });
};

// Belirli bir koç türündeki session'ları bulma
aiChatSessionSchema.statics.findSessionsByCoachType = function(userId: string, coachType: string) {
  return this.find({ userId, coachType, isActive: true }).sort({ updatedAt: -1 });
};

// Belirli bir koç ile olan session'ları bulma
aiChatSessionSchema.statics.findSessionsByCoachId = function(userId: string, coachId: string) {
  return this.find({ userId, coachId, isActive: true }).sort({ updatedAt: -1 });
};

// Build metodu
aiChatSessionSchema.statics.build = (attrs: AIChatSession) => {
  return new AIChatSession(attrs);
};

const AIChatSession = mongoose.model<AIChatSessionDoc, AIChatSessionModel>(
  "AIChatSession",
  aiChatSessionSchema
);

export { AIChatSession, AIChatSessionDoc, AIChatMessage };
