"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlineStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const onlineStatusSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    socketId: {
        type: String,
        required: false,
    },
}, { timestamps: true });
// Indexes
onlineStatusSchema.index({ isOnline: 1 });
// Static methods
onlineStatusSchema.statics.build = (attrs) => {
    return new OnlineStatus(attrs);
};
const OnlineStatus = mongoose_1.default.model("OnlineStatus", onlineStatusSchema);
exports.OnlineStatus = OnlineStatus;
