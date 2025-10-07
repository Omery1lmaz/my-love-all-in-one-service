"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthScore = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_update_if_current_1 = require("mongoose-update-if-current");
const healthScoreSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    partnerId: {
        type: String,
        required: true,
    },
    overall: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    communication: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    intimacy: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    trust: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    satisfaction: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    conflictResolution: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    calculatedAt: {
        type: Date,
        default: Date.now,
    },
    dataPoints: {
        messageCount: {
            type: Number,
            default: 0,
        },
        responseTime: {
            type: Number,
            default: 0,
        },
        positiveSentiment: {
            type: Number,
            default: 0,
        },
        activityEngagement: {
            type: Number,
            default: 0,
        },
        conflictCount: {
            type: Number,
            default: 0,
        },
        moodScores: {
            type: [Number],
            default: [],
        },
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
healthScoreSchema.set("versionKey", "version");
healthScoreSchema.plugin(mongoose_update_if_current_1.updateIfCurrentPlugin);
// Indexes for better performance
healthScoreSchema.index({ userId: 1, calculatedAt: -1 });
healthScoreSchema.index({ partnerId: 1, calculatedAt: -1 });
healthScoreSchema.index({ userId: 1, partnerId: 1, calculatedAt: -1 });
healthScoreSchema.statics.build = (attrs) => {
    return new HealthScore(attrs);
};
const HealthScore = mongoose_1.default.model("HealthScore", healthScoreSchema);
exports.HealthScore = HealthScore;
