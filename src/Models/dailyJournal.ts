import mongoose from "mongoose";

// ** Daily Journal Özellikleri (Giriş Verileri) **
interface DailyJournalAttrs {
  user: mongoose.Schema.Types.ObjectId;
  date: Date;
  title?: string;
  content: string;
  mood?: string;
  photos?: mongoose.Schema.Types.ObjectId[];
  partner?: mongoose.Schema.Types.ObjectId;
  coverPhoto?: mongoose.Schema.Types.ObjectId;
  isPrivate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ** Daily Journal Modeli (Veritabanı Dokümanı) **
interface DailyJournalDoc extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  date: Date;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  coverPhoto?: mongoose.Schema.Types.ObjectId;
  photos: mongoose.Schema.Types.ObjectId[];
  partner: mongoose.Schema.Types.ObjectId;
  weather: {
    condition: string;
    temperature: number;
    location: string;
  };
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ** Daily Journal Modeli için Static Metotlar **
interface DailyJournalModel extends mongoose.Model<DailyJournalDoc> {
  build(attrs: DailyJournalAttrs): DailyJournalDoc;
}

// ** Daily Journal Şeması Tanımlama **
const dailyJournalSchema = new mongoose.Schema<DailyJournalDoc>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mood: {
      type: String,
      enum: [
        "happy",
        "sad",
        "angry",
        "stressed",
        "excited",
        "tired",
        "peaceful",
        "anxious",
        "neutral",
      ],
      default: "neutral",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    coverPhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
    },
    weather: {
      condition: {
        type: String,
        trim: true,
      },
      temperature: {
        type: Number,
      },
      location: {
        type: String,
        trim: true,
      },
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, ...rest } = ret;
        return { id: _id, ...rest };
      },
    },
  }
);

// ** GeoJSON için 2dsphere index ekleme **
dailyJournalSchema.index({ "location.coordinates": "2dsphere" });

// ** Tarih ve kullanıcı bazlı indexler **
dailyJournalSchema.index({ date: 1 });
dailyJournalSchema.index({ user: 1, date: 1 });
dailyJournalSchema.index({ tags: 1 });

// ** Daily Journal Oluşturma Metodu **
dailyJournalSchema.statics.build = (attrs: DailyJournalAttrs) => {
  return new DailyJournal(attrs);
};

// ** Daily Journal Modelini Oluşturma **
const DailyJournal = mongoose.model<DailyJournalDoc, DailyJournalModel>(
  "DailyJournal",
  dailyJournalSchema
);

export { DailyJournal };
