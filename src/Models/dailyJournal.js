"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyJournal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// ** Daily Journal Şeması Tanımlama **
const dailyJournalSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Photo",
        },
    ],
    partner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    coverPhoto: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            const { _id, __v } = ret, rest = __rest(ret, ["_id", "__v"]);
            return Object.assign({ id: _id }, rest);
        },
    },
});
// ** GeoJSON için 2dsphere index ekleme **
dailyJournalSchema.index({ "location.coordinates": "2dsphere" });
// ** Tarih ve kullanıcı bazlı indexler **
dailyJournalSchema.index({ date: 1 });
dailyJournalSchema.index({ user: 1, date: 1 });
dailyJournalSchema.index({ tags: 1 });
// ** Daily Journal Oluşturma Metodu **
dailyJournalSchema.statics.build = (attrs) => {
    return new DailyJournal(attrs);
};
// ** Daily Journal Modelini Oluşturma **
const DailyJournal = mongoose_1.default.model("DailyJournal", dailyJournalSchema);
exports.DailyJournal = DailyJournal;
