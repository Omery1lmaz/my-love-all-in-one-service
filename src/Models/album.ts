import mongoose from "mongoose";

// ** Albüm Özellikleri (Giriş Verileri) **
interface AlbumAttrs {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  description?: string;
  coverPhoto?: mongoose.Schema.Types.ObjectId;
  photos?: mongoose.Schema.Types.ObjectId[];
  event?: string;
  isPrivate?: boolean;
  musicDetails?: {
    name: string;
    artist: string;
    album: string;
    albumImage: string;
    spotifyUrl: string;
  };
  categories?: string[];
  location?: {
    city?: string;
    country?: string;
    coordinates?: {
      type?: "Point";
      coordinates?: [number, number]; // [longitude, latitude]
    };
  };
  sizeInMB?: number;
  allowCollaboration?: boolean;
  collaborators?: mongoose.Schema.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ** Albüm Modeli (Veritabanı Dokümanı) **
interface AlbumDoc extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  coverPhoto: mongoose.Schema.Types.ObjectId;
  photos: mongoose.Schema.Types.ObjectId[];
  event: string;
  isPrivate: boolean;
  musicDetails?: {
    name: string;
    artist: string;
    album: string;
    albumImage: string;
    spotifyUrl: string;
  };
  categories: string[];
  location: {
    city?: string;
    country?: string;
    coordinates?: {
      type: "Point";
      coordinates?: [number, number]; // [longitude, latitude]
    };
  };
  sizeInMB: number;
  allowCollaboration: boolean;
  collaborators: mongoose.Schema.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ** Albüm Modeli için Static Metotlar **
interface AlbumModel extends mongoose.Model<AlbumDoc> {
  build(attrs: AlbumAttrs): AlbumDoc;
}

// ** Albüm Şeması Tanımlama (GeoJSON Destekli) **
const albumSchema = new mongoose.Schema<AlbumDoc>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    coverPhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      required: false,
    },
    musicDetails: {
      name: { type: String, default: "" },
      artist: { type: String, default: "" },
      album: { type: String, default: "" },
      albumImage: { type: String, default: "" },
      spotifyUrl: { type: String, default: "" },
    },
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
    event: {
      type: String,
      default: "", // Özel bir etkinlik için albüm (örn: Doğum Günü, Tatil)
      trim: true,
    },
    isPrivate: {
      type: Boolean,
      default: false, // Albümün gizlilik ayarı
    },
    categories: [
      {
        type: String,
        trim: true, // Albüm kategorileri (örn: Seyahat, Aile, Doğa)
      },
    ],
    location: {
      city: {
        type: String,
        trim: false, // Çekim yapılan şehir
      },
      country: {
        type: String,
        trim: false, // Çekim yapılan ülke
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          required: false,
        },
        coordinates: {
          type: [Number], // [longitude, latitude] sıralaması
          required: false,
        },
      },
    },
    sizeInMB: {
      type: Number,
      default: 0, // Albümün toplam boyutu (MB cinsinden)
    },
    allowCollaboration: {
      type: Boolean,
      default: false, // Başka kullanıcılar albüme fotoğraf ekleyebilir mi?
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // İşbirliği yapan kullanıcılar
      },
    ],
    startDate: {
      type: Date, // Albümün başlangıç tarihi (örneğin tatil süresi)
    },
    endDate: {
      type: Date, // Albümün bitiş tarihi (örneğin tatil süresi)
    },
  },
  { timestamps: true }
);

// ** GeoJSON için 2dsphere index ekleme **
albumSchema.index({ "location.coordinates": "2dsphere" });

// ** Albüm Oluşturma Metodu **
albumSchema.statics.build = (attrs: AlbumAttrs) => {
  return new Album(attrs);
};

// ** Albüm Modelini Oluşturma **
const Album = mongoose.model<AlbumDoc, AlbumModel>("Album", albumSchema);

export { Album };
