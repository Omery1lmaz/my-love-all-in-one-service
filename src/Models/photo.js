"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Photo = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LocationSchema = new mongoose_1.Schema({
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: {
            type: [Number],
            index: "2dsphere",
        },
    },
}, { _id: false });
const momentSubSchema = new mongoose_1.Schema({
    description: { type: String, required: false },
}, { _id: false });
// ** Fotoğraf Şeması Tanımlama **
const photoSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    album: { type: mongoose_1.Schema.Types.ObjectId, ref: "Album", default: null },
    event: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event", default: null },
    dailyJournal: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event", default: null },
    timeline: { type: mongoose_1.Schema.Types.ObjectId, ref: "Timeline", default: null },
    photoDate: { type: Date, default: new Date(Date.now()) },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    title: { type: String, default: "", required: false },
    isPrivate: { type: Boolean, default: false },
    musicUrl: { type: String, default: "" },
    musicDetails: {
        name: { type: String, default: "" },
        artist: { type: String, default: "" },
        album: { type: String, default: "" },
        albumImage: { type: String, default: "" },
        spotifyUrl: { type: String, default: "" },
    },
    note: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
    location: { type: LocationSchema, default: null }, // **Konum Eklendi**
    filterName: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    fileType: { type: String, default: "image/jpeg" },
    fileSize: { type: Number, default: 0 },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    moment: {
        me: { type: momentSubSchema, required: false },
        partner: { type: momentSubSchema, required: false },
    },
}, { timestamps: true });
// ** Fotoğraf Oluşturma Metodu **
photoSchema.statics.build = (attrs) => {
    return new Photo(attrs);
};
// ** Fotoğraf Modelini Oluşturma **
const Photo = mongoose_1.default.model("Photo", photoSchema);
exports.Photo = Photo;
