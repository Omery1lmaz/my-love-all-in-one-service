import mongoose from "mongoose";

interface OnlineStatusAttrs {
  userId: mongoose.Schema.Types.ObjectId;
  isOnline: boolean;
  lastSeen?: Date;
  socketId?: string;
}

interface OnlineStatusDoc extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  isOnline: boolean;
  lastSeen: Date;
  socketId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OnlineStatusModel extends mongoose.Model<OnlineStatusDoc> {
  build(attrs: OnlineStatusAttrs): OnlineStatusDoc;
}

const onlineStatusSchema = new mongoose.Schema<OnlineStatusDoc>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

// Indexes
onlineStatusSchema.index({ isOnline: 1 });

// Static methods
onlineStatusSchema.statics.build = (attrs: OnlineStatusAttrs) => {
  return new OnlineStatus(attrs);
};

const OnlineStatus = mongoose.model<OnlineStatusDoc, OnlineStatusModel>(
  "OnlineStatus",
  onlineStatusSchema
);

export { OnlineStatus, OnlineStatusAttrs }; 