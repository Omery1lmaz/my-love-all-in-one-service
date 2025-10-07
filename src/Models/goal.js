"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_update_if_current_1 = require("mongoose-update-if-current");
const milestoneSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    },
});
const goalSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    partnerId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ["communication", "intimacy", "trust", "activities", "conflict"],
    },
    targetValue: {
        type: Number,
        required: true,
    },
    currentValue: {
        type: Number,
        default: 0,
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    deadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "completed", "paused", "failed"],
        default: "active",
    },
    milestones: [milestoneSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
goalSchema.set("versionKey", "version");
goalSchema.plugin(mongoose_update_if_current_1.updateIfCurrentPlugin);
// Indexes for better performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ partnerId: 1, status: 1 });
goalSchema.index({ userId: 1, partnerId: 1, status: 1 });
goalSchema.index({ category: 1, status: 1 });
goalSchema.index({ deadline: 1, status: 1 });
// Update the updatedAt field before saving
goalSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
goalSchema.statics.build = (attrs) => {
    return new Goal(attrs);
};
const Goal = mongoose_1.default.model("Goal", goalSchema);
exports.Goal = Goal;
