import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface InsightAttrs {
  userId: string;
  partnerId: string;
  type: "positive" | "warning" | "suggestion" | "achievement";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  category: "communication" | "intimacy" | "trust" | "activities" | "conflict";
  actionable?: boolean;
  actionItems?: string[];
  confidence: number;
  aiGenerated?: boolean;
  createdAt?: Date;
  readAt?: Date;
  appliedAt?: Date;
  dismissedAt?: Date;
}

interface InsightDoc extends mongoose.Document {
  userId: string;
  partnerId: string;
  type: "positive" | "warning" | "suggestion" | "achievement";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  category: "communication" | "intimacy" | "trust" | "activities" | "conflict";
  actionable: boolean;
  actionItems: string[];
  confidence: number;
  aiGenerated: boolean;
  createdAt: Date;
  readAt?: Date;
  appliedAt?: Date;
  dismissedAt?: Date;
  version: number;
}

interface InsightModel extends mongoose.Model<InsightDoc> {
  build(attrs: InsightAttrs): InsightDoc;
}

const insightSchema = new mongoose.Schema(
  {
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

insightSchema.set("versionKey", "version");
insightSchema.plugin(updateIfCurrentPlugin);

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

insightSchema.statics.build = (attrs: InsightAttrs) => {
  return new Insight(attrs);
};

const Insight = mongoose.model<InsightDoc, InsightModel>("Insight", insightSchema);

export { Insight };

