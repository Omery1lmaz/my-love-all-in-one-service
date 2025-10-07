import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface HealthScoreAttrs {
  userId: string;
  partnerId: string;
  overall: number;
  communication: number;
  intimacy: number;
  trust: number;
  satisfaction: number;
  conflictResolution: number;
  calculatedAt?: Date;
  dataPoints: {
    messageCount: number;
    responseTime: number;
    positiveSentiment: number;
    activityEngagement: number;
    conflictCount: number;
    moodScores: number[];
  };
}

interface HealthScoreDoc extends mongoose.Document {
  userId: string;
  partnerId: string;
  overall: number;
  communication: number;
  intimacy: number;
  trust: number;
  satisfaction: number;
  conflictResolution: number;
  calculatedAt: Date;
  dataPoints: {
    messageCount: number;
    responseTime: number;
    positiveSentiment: number;
    activityEngagement: number;
    conflictCount: number;
    moodScores: number[];
  };
  version: number;
}

interface HealthScoreModel extends mongoose.Model<HealthScoreDoc> {
  build(attrs: HealthScoreAttrs): HealthScoreDoc;
}

const healthScoreSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

healthScoreSchema.set("versionKey", "version");
healthScoreSchema.plugin(updateIfCurrentPlugin);

// Indexes for better performance
healthScoreSchema.index({ userId: 1, calculatedAt: -1 });
healthScoreSchema.index({ partnerId: 1, calculatedAt: -1 });
healthScoreSchema.index({ userId: 1, partnerId: 1, calculatedAt: -1 });

healthScoreSchema.statics.build = (attrs: HealthScoreAttrs) => {
  return new HealthScore(attrs);
};

const HealthScore = mongoose.model<HealthScoreDoc, HealthScoreModel>(
  "HealthScore",
  healthScoreSchema
);

export { HealthScore };

