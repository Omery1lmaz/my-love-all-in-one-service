"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_update_if_current_1 = require("mongoose-update-if-current");
const moodTrendSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        required: true,
    },
    userMood: {
        type: Number,
        required: true,
    },
    partnerMood: {
        type: Number,
        required: true,
    },
    relationshipMood: {
        type: Number,
        required: true,
    },
    factors: {
        weather: {
            type: Number,
            default: 0,
        },
        stress: {
            type: Number,
            default: 0,
        },
        health: {
            type: Number,
            default: 0,
        },
        work: {
            type: Number,
            default: 0,
        },
    },
});
const activityEngagementSchema = new mongoose_1.default.Schema({
    category: {
        type: String,
        required: true,
    },
    frequency: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    satisfaction: {
        type: Number,
        required: true,
    },
    trend: {
        type: String,
        required: true,
    },
});
const achievementSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    badge: {
        type: String,
        required: true,
    },
});
const challengeSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    reward: {
        type: String,
        required: true,
    },
});
const reportSchema = new mongoose_1.default.Schema({
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
        enum: ["weekly", "monthly", "quarterly"],
    },
    periodStart: {
        type: Date,
        required: true,
    },
    periodEnd: {
        type: Date,
        required: true,
    },
    healthScore: {
        overall: {
            type: Number,
            required: true,
        },
        communication: {
            type: Number,
            required: true,
        },
        intimacy: {
            type: Number,
            required: true,
        },
        trust: {
            type: Number,
            required: true,
        },
        satisfaction: {
            type: Number,
            required: true,
        },
        conflictResolution: {
            type: Number,
            required: true,
        },
    },
    communicationPattern: {
        frequency: {
            daily: {
                type: Number,
                default: 0,
            },
            weekly: {
                type: Number,
                default: 0,
            },
            monthly: {
                type: Number,
                default: 0,
            },
        },
        quality: {
            positive: {
                type: Number,
                default: 0,
            },
            neutral: {
                type: Number,
                default: 0,
            },
            negative: {
                type: Number,
                default: 0,
            },
        },
        responseTime: {
            average: {
                type: Number,
                default: 0,
            },
            consistency: {
                type: Number,
                default: 0,
            },
        },
        topics: {
            romantic: {
                type: Number,
                default: 0,
            },
            daily: {
                type: Number,
                default: 0,
            },
            future: {
                type: Number,
                default: 0,
            },
            problems: {
                type: Number,
                default: 0,
            },
            fun: {
                type: Number,
                default: 0,
            },
        },
    },
    moodTrends: [moodTrendSchema],
    activityEngagement: [activityEngagementSchema],
    conflictAnalysis: {
        frequency: {
            type: Number,
            default: 0,
        },
        intensity: {
            type: Number,
            default: 0,
        },
        resolutionTime: {
            type: Number,
            default: 0,
        },
        topics: {
            type: [String],
            default: [],
        },
        resolutionMethods: {
            discussion: {
                type: Number,
                default: 0,
            },
            compromise: {
                type: Number,
                default: 0,
            },
            avoidance: {
                type: Number,
                default: 0,
            },
            external_help: {
                type: Number,
                default: 0,
            },
        },
    },
    insights: {
        type: [String],
        default: [],
    },
    recommendations: {
        immediate: {
            type: [String],
            default: [],
        },
        shortTerm: {
            type: [String],
            default: [],
        },
        longTerm: {
            type: [String],
            default: [],
        },
    },
    achievements: [achievementSchema],
    challenges: [challengeSchema],
    generatedAt: {
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
reportSchema.set("versionKey", "version");
reportSchema.plugin(mongoose_update_if_current_1.updateIfCurrentPlugin);
// Indexes for better performance
reportSchema.index({ userId: 1, type: 1, periodStart: -1 });
reportSchema.index({ partnerId: 1, type: 1, periodStart: -1 });
reportSchema.index({ userId: 1, partnerId: 1, type: 1, periodStart: -1 });
reportSchema.index({ generatedAt: -1 });
reportSchema.statics.build = (attrs) => {
    return new Report(attrs);
};
const Report = mongoose_1.default.model("Report", reportSchema);
exports.Report = Report;
