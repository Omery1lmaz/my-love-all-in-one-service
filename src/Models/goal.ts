import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface GoalAttrs {
  userId: string;
  partnerId: string;
  title: string;
  description: string;
  category: "communication" | "intimacy" | "trust" | "activities" | "conflict";
  targetValue: number;
  currentValue?: number;
  progress?: number;
  deadline: Date;
  status?: "active" | "completed" | "paused" | "failed";
  milestones?: {
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface GoalDoc extends mongoose.Document {
  userId: string;
  partnerId: string;
  title: string;
  description: string;
  category: "communication" | "intimacy" | "trust" | "activities" | "conflict";
  targetValue: number;
  currentValue: number;
  progress: number;
  deadline: Date;
  status: "active" | "completed" | "paused" | "failed";
  milestones: {
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface GoalModel extends mongoose.Model<GoalDoc> {
  build(attrs: GoalAttrs): GoalDoc;
}

const milestoneSchema = new mongoose.Schema({
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

const goalSchema = new mongoose.Schema(
  {
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

goalSchema.set("versionKey", "version");
goalSchema.plugin(updateIfCurrentPlugin);

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

goalSchema.statics.build = (attrs: GoalAttrs) => {
  return new Goal(attrs);
};

const Goal = mongoose.model<GoalDoc, GoalModel>("Goal", goalSchema);

export { Goal };

