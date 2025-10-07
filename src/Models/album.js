"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Album = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// ** Albüm Şeması Tanımlama (GeoJSON Destekli) **
const albumSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User", // İşbirliği yapan kullanıcılar
        },
    ],
    startDate: {
        type: Date, // Albümün başlangıç tarihi (örneğin tatil süresi)
    },
    endDate: {
        type: Date, // Albümün bitiş tarihi (örneğin tatil süresi)
    },
}, { timestamps: true });
// ** GeoJSON için 2dsphere index ekleme **
albumSchema.index({ "location.coordinates": "2dsphere" });
// ** Albüm Oluşturma Metodu **
albumSchema.statics.build = (attrs) => {
    return new Album(attrs);
};
// ** Albüm Modelini Oluşturma **
const Album = mongoose_1.default.model("Album", albumSchema);
exports.Album = Album;
