"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatSession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const aiChatMessageSchema = new mongoose_1.default.Schema({
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
const aiChatSessionSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
// Session ID oluşturma için index
aiChatSessionSchema.index({ userId: 1, sessionId: 1 });
// Kullanıcının aktif sohbetlerini bulma
aiChatSessionSchema.statics.findActiveSessionsByUser = function (userId) {
    return this.find({ userId, isActive: true }).sort({ updatedAt: -1 });
};
// Belirli bir session'ı bulma
aiChatSessionSchema.statics.findSessionById = function (sessionId, userId) {
    return this.findOne({ sessionId, userId, isActive: true });
};
// Belirli bir koç türündeki session'ları bulma
aiChatSessionSchema.statics.findSessionsByCoachType = function (userId, coachType) {
    return this.find({ userId, coachType, isActive: true }).sort({ updatedAt: -1 });
};
// Belirli bir koç ile olan session'ları bulma
aiChatSessionSchema.statics.findSessionsByCoachId = function (userId, coachId) {
    return this.find({ userId, coachId, isActive: true }).sort({ updatedAt: -1 });
};
// Build metodu
aiChatSessionSchema.statics.build = (attrs) => {
    return new AIChatSession(attrs);
};
const AIChatSession = mongoose_1.default.model("AIChatSession", aiChatSessionSchema);
exports.AIChatSession = AIChatSession;
