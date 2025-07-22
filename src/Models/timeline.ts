import mongoose, { Schema, Document, Model } from "mongoose";

interface TimelineAttrs {
  userId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  type:
    | "anniversary"
    | "first_meet"
    | "first_date"
    | "special_moment"
    | "custom";
  photos?: mongoose.Types.ObjectId[];
  coverPhotoId?: mongoose.Types.ObjectId;
  isPrivate?: boolean;
  icon?: string;
}

interface TimelineDoc extends Document, TimelineAttrs {
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineModel extends Model<TimelineDoc> {
  build(attrs: TimelineAttrs): TimelineDoc;
}

const TimelineSchema = new Schema<TimelineDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: [
        "anniversary",
        "first_meet",
        "first_date",
        "special_moment",
        "custom",
      ],
      default: "custom",
    },
    photos: [{ type: Schema.Types.ObjectId, ref: "Photo" }],
    coverPhotoId: { type: Schema.Types.ObjectId, ref: "Photo" },
    isPrivate: { type: Boolean, default: false },
    icon: { type: String, default: "heart" },
  },
  { timestamps: true }
);

TimelineSchema.statics.build = function (attrs: TimelineAttrs) {
  return new this(attrs);
};

const Timeline = mongoose.model<TimelineDoc, TimelineModel>(
  "Timeline",
  TimelineSchema
);

export { Timeline };
