"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhotoController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@heaven-nsoft/common");
const photo_1 = require("../Models/photo");
const sharp_1 = __importDefault(require("sharp"));
const upload_1 = require("../utils/upload");
const storageService_1 = require("../services/storageService");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const uploadPhotoController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedToken = null;
    try {
        console.log("uploadPhotoController");
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                return next(new common_1.NotAuthorizedError());
            const token = authHeader.split(" ")[1];
            try {
                decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            }
            catch (_a) {
                next(new common_1.NotAuthorizedError());
                return;
            }
            if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id) || !req.file) {
                next(new common_1.BadRequestError("File upload failed"));
                return;
            }
            const { album, description = "", tags = [], musicUrl = "", title = "", note = "", location, musicDetails, photoDate = new Date(), isPrivate = false, } = req.body;
            // Safe JSON parsing with proper error handling
            const parsedTags = tags && tags !== ""
                ? (() => {
                    try {
                        return JSON.parse(tags);
                    }
                    catch (_a) {
                        return [];
                    }
                })()
                : [];
            const parsedLocation = location && location !== ""
                ? (() => {
                    try {
                        return JSON.parse(location);
                    }
                    catch (_a) {
                        return null;
                    }
                })()
                : null;
            const parsedDate = photoDate && !isNaN(new Date(photoDate).getTime())
                ? new Date(photoDate)
                : new Date();
            const parsedIsPrivate = typeof isPrivate === "string"
                ? (() => {
                    try {
                        return JSON.parse(isPrivate);
                    }
                    catch (_a) {
                        return false;
                    }
                })()
                : isPrivate;
            const parsedMusicDetails = musicDetails && musicDetails !== ""
                ? (() => {
                    try {
                        return JSON.parse(musicDetails);
                    }
                    catch (_a) {
                        return null;
                    }
                })()
                : null;
            const file = req.file;
            console.log(photoDate, "photoDate");
            // Ensure user has a subscription (create default if not exists) - FIRST
            console.log(`Ensuring subscription exists for user: ${decodedToken.id}`);
            let userSubscription;
            try {
                userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
                console.log(`Subscription verified/created for user: ${decodedToken.id}`, {
                    subscriptionId: userSubscription._id,
                    planType: userSubscription.planType,
                    isActive: userSubscription.isActive,
                    storageLimit: userSubscription.storageLimit,
                    maxPhotos: userSubscription.maxPhotos
                });
                // Double check that subscription is active
                if (!userSubscription.isActive) {
                    console.warn(`Subscription found but inactive for user: ${decodedToken.id}, activating...`);
                    userSubscription.isActive = true;
                    yield userSubscription.save();
                    console.log(`Subscription activated for user: ${decodedToken.id}`);
                }
            }
            catch (error) {
                console.error(`Error with subscription for user ${decodedToken.id}:`, error);
                return next(new common_1.BadRequestError("Failed to create or verify subscription"));
            }
            // Check storage limits before upload - AFTER subscription is confirmed
            console.log(`Checking upload permission for user: ${decodedToken.id}, file size: ${file.size} bytes`);
            const canUpload = yield storageService_1.StorageService.canUploadPhoto(new mongoose_1.default.Types.ObjectId(decodedToken.id), file.size);
            if (!canUpload.canUpload) {
                console.error(`Upload denied for user ${decodedToken.id}:`, {
                    reason: canUpload.reason,
                    storageInfo: canUpload.storageInfo,
                    userSubscription: {
                        planType: userSubscription.planType,
                        storageLimit: userSubscription.storageLimit,
                        maxPhotos: userSubscription.maxPhotos
                    }
                });
                return next(new common_1.BadRequestError(canUpload.reason || "Upload not allowed"));
            }
            console.log(`Upload permission granted for user: ${decodedToken.id}`, {
                storageInfo: canUpload.storageInfo
            });
            // S3 için isim üret
            const fileName = `${Date.now()}-${file.originalname}`;
            const thumbnailName = `thumb-${fileName}`;
            // Orijinal ve Thumbnail oluştur
            console.log(`Starting S3 upload for user: ${decodedToken.id}, fileName: ${fileName}`);
            let originalUrl;
            let thumbnailUrl;
            try {
                const [originalResult, thumbnailResult] = yield Promise.all([
                    (0, upload_1.uploadToS3)(file.buffer, fileName, file.mimetype),
                    (0, sharp_1.default)(file.buffer)
                        .resize({ width: 300 })
                        .toBuffer()
                        .then((thumbBuffer) => (0, upload_1.uploadToS3)(thumbBuffer, thumbnailName, file.mimetype)),
                ]);
                originalUrl = originalResult;
                thumbnailUrl = thumbnailResult;
                console.log(`S3 upload successful for user: ${decodedToken.id}`, { originalUrl, thumbnailUrl });
            }
            catch (error) {
                console.error(`S3 upload failed for user ${decodedToken.id}:`, error);
                throw error;
            }
            // Extract image dimensions using sharp
            const imageMetadata = yield (0, sharp_1.default)(file.buffer).metadata();
            const newPhoto = new photo_1.Photo({
                user: decodedToken.id,
                album,
                url: originalUrl,
                thumbnailUrl,
                moment: {
                    me: {
                        description,
                    },
                    partner: {
                        description: "",
                    },
                },
                photoDate: parsedDate || new Date(),
                tags: parsedTags,
                musicUrl,
                title,
                note,
                location: parsedLocation,
                musicDetails: parsedMusicDetails,
                isPrivate: parsedIsPrivate,
                fileSize: file.size,
                originalName: file.originalname,
                mimeType: file.mimetype,
                width: imageMetadata.width,
                height: imageMetadata.height,
            });
            console.log(`Saving photo to database for user: ${decodedToken.id}`);
            const savedPhoto = yield newPhoto.save();
            console.log(`Photo saved successfully with ID: ${savedPhoto._id}`);
            // Update user's storage usage after successful upload
            console.log(`Updating storage usage for user: ${decodedToken.id}`);
            try {
                yield storageService_1.StorageService.updateUserStorage(new mongoose_1.default.Types.ObjectId(decodedToken.id));
                console.log(`Storage usage updated for user: ${decodedToken.id}`);
            }
            catch (error) {
                console.error(`Error updating storage usage for user ${decodedToken.id}:`, error);
                // Don't throw here, photo is already saved
            }
            // Get storage info for response (with fallback)
            let storageInfo;
            try {
                storageInfo = yield storageService_1.StorageService.getUserStorageInfo(new mongoose_1.default.Types.ObjectId(decodedToken.id));
                console.log(`Storage info retrieved for user: ${decodedToken.id}`);
            }
            catch (error) {
                console.error(`Error getting final storage info for user ${decodedToken.id}:`, error);
                // Provide default storage info if retrieval fails
                storageInfo = {
                    storageUsage: { totalStorageUsed: 0, photosCount: 0 },
                    subscription: { storageLimit: 1024 * 1024 * 100, maxPhotos: 50, planType: "free" },
                    storagePercentage: 0,
                    photosPercentage: 0
                };
            }
            console.log(`Photo upload completed successfully for user: ${decodedToken.id}`);
            res.status(201).json({
                message: "Photo created successfully",
                imageUrl: originalUrl,
                thumbnailUrl,
                photo: savedPhoto,
                storageInfo: {
                    usedStorage: storageService_1.StorageService.formatBytes(storageInfo.storageUsage.totalStorageUsed),
                    totalStorage: storageService_1.StorageService.formatBytes(storageInfo.subscription.storageLimit),
                    usedPhotos: storageInfo.storageUsage.photosCount,
                    maxPhotos: storageInfo.subscription.maxPhotos,
                    storagePercentage: storageInfo.storagePercentage.toFixed(1),
                    photosPercentage: storageInfo.photosPercentage.toFixed(1),
                    planType: storageInfo.subscription.planType,
                },
            });
        }
        catch (error) {
            console.error("Error in photo upload process:", {
                error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
                stack: error === null || error === void 0 ? void 0 : error.stack,
                userId: (decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id) || 'unknown',
                timestamp: new Date().toISOString()
            });
            next(new common_1.BadRequestError("Internal server error"));
            return;
        }
    }
    catch (error) {
        console.error("Critical error in uploadPhotoController:", {
            error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
            stack: error === null || error === void 0 ? void 0 : error.stack,
            timestamp: new Date().toISOString()
        });
        next(new common_1.BadRequestError("Internal server error"));
        return;
    }
});
exports.uploadPhotoController = uploadPhotoController;
exports.default = exports.uploadPhotoController;
