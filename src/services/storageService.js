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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const storageUsage_1 = require("../Models/storageUsage");
const subscription_1 = require("../Models/subscription");
class StorageService {
    /**
     * Update user's storage usage after photo upload/delete
     */
    static updateUserStorage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield storageUsage_1.StorageUsage.updateUserStorage(userId);
            }
            catch (error) {
                console.error("Error updating user storage:", error);
                throw error;
            }
        });
    }
    /**
     * Check if user can upload a photo based on storage limits
     */
    static canUploadPhoto(userId, fileSize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscription = yield subscription_1.Subscription.getActiveSubscription(userId);
                if (!subscription) {
                    return {
                        canUpload: false,
                        reason: "No active subscription found"
                    };
                }
                const storageUsage = yield storageUsage_1.StorageUsage.findOne({ user: userId });
                const currentUsage = (storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.totalStorageUsed) || 0;
                const currentPhotosCount = (storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.photosCount) || 0;
                // Check storage limit
                if (currentUsage + fileSize > subscription.storageLimit) {
                    return {
                        canUpload: false,
                        reason: "Storage limit exceeded",
                        storageInfo: {
                            currentUsage,
                            storageLimit: subscription.storageLimit,
                            remainingSpace: subscription.storageLimit - currentUsage
                        }
                    };
                }
                // Check photo count limit
                if (currentPhotosCount >= subscription.maxPhotos) {
                    return {
                        canUpload: false,
                        reason: "Photo count limit exceeded",
                        storageInfo: {
                            currentPhotos: currentPhotosCount,
                            maxPhotos: subscription.maxPhotos
                        }
                    };
                }
                return {
                    canUpload: true,
                    storageInfo: {
                        currentUsage,
                        storageLimit: subscription.storageLimit,
                        remainingSpace: subscription.storageLimit - currentUsage,
                        currentPhotos: currentPhotosCount,
                        maxPhotos: subscription.maxPhotos
                    }
                };
            }
            catch (error) {
                console.error("Error checking upload permission:", error);
                throw error;
            }
        });
    }
    /**
     * Get user's storage information
     */
    static getUserStorageInfo(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [storageUsage, subscription] = yield Promise.all([
                    storageUsage_1.StorageUsage.findOne({ user: userId }),
                    subscription_1.Subscription.getActiveSubscription(userId)
                ]);
                if (!subscription) {
                    throw new Error("No active subscription found");
                }
                const storagePercentage = subscription.storageLimit > 0
                    ? ((storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.totalStorageUsed) || 0) / subscription.storageLimit * 100
                    : 0;
                const photosPercentage = subscription.maxPhotos > 0
                    ? ((storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.photosCount) || 0) / subscription.maxPhotos * 100
                    : 0;
                return {
                    storageUsage,
                    subscription,
                    storagePercentage: Math.min(100, storagePercentage),
                    photosPercentage: Math.min(100, photosPercentage)
                };
            }
            catch (error) {
                console.error("Error getting user storage info:", error);
                throw error;
            }
        });
    }
    /**
     * Format bytes to human readable format
     */
    static formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Get storage plan details
     */
    static getStoragePlanDetails(planType) {
        const plans = {
            free: {
                storageLimit: 1024 * 1024 * 100, // 100MB
                maxPhotos: 50,
                price: 0,
                features: ["Basic photo storage", "Limited to 50 photos"]
            },
            premium: {
                storageLimit: 1024 * 1024 * 1024 * 5, // 5GB
                maxPhotos: 1000,
                price: 9.99,
                features: ["5GB storage", "Up to 1000 photos", "Priority support"]
            },
            premium_plus: {
                storageLimit: 1024 * 1024 * 1024 * 50, // 50GB
                maxPhotos: 10000,
                price: 19.99,
                features: ["50GB storage", "Unlimited photos", "Priority support", "Advanced features"]
            }
        };
        return plans[planType];
    }
}
exports.StorageService = StorageService;
exports.default = StorageService;
