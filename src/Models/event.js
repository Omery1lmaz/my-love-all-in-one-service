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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// --- Sub-schemas ---
const CoordinatesSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
}, { _id: false });
const LocationSchema = new mongoose_1.Schema({
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
        type: CoordinatesSchema,
        index: "2dsphere",
    },
}, { _id: false });
const RecurrenceSchema = new mongoose_1.Schema({
    frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
        required: true,
    },
    interval: { type: Number, default: 1 },
    endDate: Date,
}, { _id: false });
const ExpenseSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
}, { _id: false });
const BudgetSchema = new mongoose_1.Schema({
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    expenses: [ExpenseSchema],
}, { _id: false });
const WeatherPreferencesSchema = new mongoose_1.Schema({
    minTemperature: Number,
    maxTemperature: Number,
    preferredConditions: [String],
}, { _id: false });
const MemorySchema = new mongoose_1.Schema({
    text: String,
    photos: [String],
    date: { type: Date, required: true },
}, { _id: false });
// --- Main Schema ---
const EventSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    partnerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: false },
    coverPhotoId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (value) {
                return (this.eventType !== "custom" || (value && value.trim().length > 0));
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
            type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
// --- Statics ---
EventSchema.statics.build = function (attrs) {
    return new this(attrs);
};
EventSchema.statics.findByLocation = function (longitude_1, latitude_1) {
    return __awaiter(this, arguments, void 0, function* (longitude, latitude, maxDistance = 5000) {
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
    });
};
const Event = mongoose_1.default.model("Event", EventSchema);
exports.Event = Event;
