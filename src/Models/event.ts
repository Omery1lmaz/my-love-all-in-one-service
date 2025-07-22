import mongoose, { Schema, Document, Model } from "mongoose";
import { Photo } from "./photo";

// --- Sub-schemas ---
const CoordinatesSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      type: CoordinatesSchema,
      index: "2dsphere",
    },
  },
  { _id: false }
);

const RecurrenceSchema = new Schema(
  {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    interval: { type: Number, default: 1 },
    endDate: Date,
  },
  { _id: false }
);

const ExpenseSchema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const BudgetSchema = new Schema(
  {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    expenses: [ExpenseSchema],
  },
  { _id: false }
);

const WeatherPreferencesSchema = new Schema(
  {
    minTemperature: Number,
    maxTemperature: Number,
    preferredConditions: [String],
  },
  { _id: false }
);

const MemorySchema = new Schema(
  {
    text: String,
    photos: [String],
    date: { type: Date, required: true },
  },
  { _id: false }
);

// --- Types ---
interface EventAttrs {
  userId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId | null;
  title: string;
  description?: string;
  eventType?:
    | "date"
    | "anniversary"
    | "birthday"
    | "gift_exchange"
    | "travel"
    | "celebration"
    | "surprise"
    | "custom";
  customEventType?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    endDate?: Date;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  mood?: "romantic" | "fun" | "adventurous" | "relaxing" | "special";
  surpriseLevel?: "none" | "small" | "medium" | "big";
  giftIdeas?: string[];
  photos?: mongoose.Types.ObjectId[];
  coverPhotoId?: mongoose.Types.ObjectId;
  notes?: string;
  budget?: {
    amount: number;
    currency: string;
    expenses?: {
      description: string;
      amount: number;
      date: Date;
    }[];
  };
  weatherDependent?: boolean;
  weatherPreferences?: {
    minTemperature?: number;
    maxTemperature?: number;
    preferredConditions?: string[];
  };
  isPrivate?: boolean;
  // memories?: {
  //   text?: string;
  //   photos?: string[];
  //   date: Date;
  // }[];
}

interface EventDoc extends Document, EventAttrs {
  createdAt: Date;
  updatedAt: Date;
}

interface EventModel extends Model<EventDoc> {
  build(attrs: EventAttrs): EventDoc;
  findByLocation(
    longitude: number,
    latitude: number,
    maxDistance?: number
  ): Promise<EventDoc[]>;
}

// --- Main Schema ---
const EventSchema = new Schema<EventDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    coverPhotoId: {
      type: Schema.Types.ObjectId,
      ref: "Photo",
      required: false,
    },
    title: { type: String, required: true },
    description: { type: String, maxlength: 500 },
    eventType: {
      type: String,
      enum: [
        "date",
        "anniversary",
        "birthday",
        "gift_exchange",
        "travel",
        "celebration",
        "surprise",
        "custom",
      ],
      default: "date",
    },
    customEventType: {
      type: String,
      validate: {
        validator: function (this: EventDoc, value: string) {
          return (
            this.eventType !== "custom" || (value && value.trim().length > 0)
          );
        },
        message: "Custom event type is required when event type is 'custom'",
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, match: /^([0-1]\d|2[0-3]):([0-5]\d)$/ },
    endTime: { type: String, match: /^([0-1]\d|2[0-3]):([0-5]\d)$/ },
    isAllDay: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: false },
    recurrence: { type: RecurrenceSchema, default: null },
    location: { type: LocationSchema, default: null },
    mood: {
      type: String,
      enum: ["romantic", "fun", "adventurous", "relaxing", "special"],
      default: "romantic",
    },
    surpriseLevel: {
      type: String,
      enum: ["none", "small", "medium", "big"],
      default: "none",
    },
    // giftIdeas: [String],
    photos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Photo",
        required: false,
      },
    ],
    notes: String,
    // budget: { type: BudgetSchema, default: null },
    // weatherDependent: { type: Boolean, default: false },
    // weatherPreferences: { type: WeatherPreferencesSchema, default: null },
    isPrivate: { type: Boolean, default: false },
    // memories: [MemorySchema],
  },
  { timestamps: true }
);

// --- Statics ---
EventSchema.statics.build = function (attrs: EventAttrs) {
  return new this(attrs);
};

EventSchema.statics.findByLocation = async function (
  longitude: number,
  latitude: number,
  maxDistance = 5000
) {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

const Event = mongoose.model<EventDoc, EventModel>("Event", EventSchema);

export { Event };
