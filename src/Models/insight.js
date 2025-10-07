"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insight = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_update_if_current_1 = require("mongoose-update-if-current");
const insightSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    partnerId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["positive", "warning", "suggestion", "achievement"],
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    impact: {
        type: String,
        required: true,
        enum: ["low", "medium", "high"],
    },
    category: {
        type: String,
        required: true,
        enum: ["communication", "intimacy", "trust", "activities", "conflict"],
    },
    actionable: {
        type: Boolean,
        default: true,
    },
    actionItems: {
        type: [String],
        default: [],
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    aiGenerated: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    readAt: {
        type: Date,
    },
    appliedAt: {
        type: Date,
    },
    dismissedAt: {
        type: Date,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
insightSchema.set("versionKey", "version");
insightSchema.plugin(mongoose_update_if_current_1.updateIfCurrentPlugin);
// Indexes for better performance
insightSchema.index({ userId: 1, createdAt: -1 });
insightSchema.index({ partnerId: 1, createdAt: -1 });
insightSchema.index({ type: 1, impact: 1 });
insightSchema.index({ category: 1, type: 1 });
insightSchema.index({ userId: 1, partnerId: 1, createdAt: -1 });
insightSchema.index({ aiGenerated: 1, createdAt: -1 });
insightSchema.index({ readAt: 1 });
insightSchema.index({ appliedAt: 1 });
insightSchema.index({ dismissedAt: 1 });
insightSchema.statics.build = (attrs) => {
    return new Insight(attrs);
};
const Insight = mongoose_1.default.model("Insight", insightSchema);
exports.Insight = Insight;
