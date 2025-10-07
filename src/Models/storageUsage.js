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
exports.StorageUsage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const storageUsageSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    totalStorageUsed: {
        type: Number,
        default: 0,
        required: true
    },
    photosCount: {
        type: Number,
        default: 0,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
        required: true
    },
}, { timestamps: true });
// Static method to update user storage
storageUsageSchema.statics.updateUserStorage = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const Photo = mongoose_1.default.model("Photo");
        // Calculate total storage used by user's photos
        const photos = yield Photo.find({
            user: userId,
            isDeleted: { $ne: true }
        });
        const totalStorageUsed = photos.reduce((total, photo) => {
            return total + (photo.fileSize || 0);
        }, 0);
        // Update or create storage usage record
        const storageUsage = yield this.findOneAndUpdate({ user: userId }, {
            totalStorageUsed,
            photosCount: photos.length,
            lastUpdated: new Date()
        }, { upsert: true, new: true });
        return storageUsage;
    });
};
storageUsageSchema.statics.build = (attrs) => {
    return new StorageUsage(attrs);
};
const StorageUsage = mongoose_1.default.model("StorageUsage", storageUsageSchema);
exports.StorageUsage = StorageUsage;
