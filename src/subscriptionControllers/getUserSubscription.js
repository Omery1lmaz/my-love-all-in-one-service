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
exports.getUserSubscription = void 0;
const common_1 = require("@heaven-nsoft/common");
const subscription_1 = require("../Models/subscription");
const storageUsage_1 = require("../Models/storageUsage");
const aiChat_1 = require("../Models/aiChat");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getUserSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getUserSubscription controller started");
        // Token doğrulama
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (_a) {
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            next(new common_1.BadRequestError("User ID not found"));
            return;
        }
        console.log(`Getting subscription for user: ${decodedToken.id}`);
        const userId = new mongoose_1.default.Types.ObjectId(decodedToken.id);
        // Kullanıcının subscription'ını getir
        const subscription = yield subscription_1.Subscription.findOne({
            user: userId,
        });
        // Kullanıcının storage kullanımını getir
        const storageUsage = yield storageUsage_1.StorageUsage.findOne({ user: userId });
        // AI chat kullanımını hesapla (bu ay içindeki mesaj sayısı)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const aiChatSessions = yield aiChat_1.AIChatSession.find({
            userId: userId,
            isActive: true,
            updatedAt: { $gte: startOfMonth },
        });
        // Toplam AI mesaj sayısını hesapla
        const totalAIMessages = aiChatSessions.reduce((total, session) => {
            return (total + session.messages.filter((msg) => msg.role === "user").length);
        }, 0);
        if (!subscription) {
            console.log(`No subscription found for user: ${decodedToken.id}, creating default`);
            // Eğer subscription yoksa default oluştur
            const newSubscription = yield subscription_1.Subscription.getDefaultSubscription(userId);
            // Kullanım detaylarını hesapla
            const currentStorageUsed = (storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.totalStorageUsed) || 0;
            const currentPhotosCount = (storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.photosCount) || 0;
            const remainingPhotos = Math.max(0, newSubscription.maxPhotos - currentPhotosCount);
            const remainingStorage = Math.max(0, newSubscription.storageLimit - currentStorageUsed);
            // AI kullanım limitlerini plan tipine göre belirle
            const aiLimits = getAILimits(newSubscription.planType);
            const remainingAIMessages = Math.max(0, aiLimits.monthlyMessages - totalAIMessages);
            res.status(200).json({
                message: "Default subscription created",
                subscription: {
                    id: newSubscription._id,
                    planType: newSubscription.planType,
                    storageLimit: newSubscription.storageLimit,
                    maxPhotos: newSubscription.maxPhotos,
                    isActive: newSubscription.isActive,
                    startDate: newSubscription.startDate,
                    endDate: newSubscription.endDate,
                    autoRenew: newSubscription.autoRenew,
                    price: newSubscription.price,
                    currency: newSubscription.currency,
                    isExpired: newSubscription.isExpired(),
                    daysUntilExpiry: newSubscription.daysUntilExpiry(),
                    createdAt: newSubscription.createdAt,
                    updatedAt: newSubscription.updatedAt,
                },
                usage: {
                    storage: {
                        used: currentStorageUsed,
                        limit: newSubscription.storageLimit,
                        remaining: remainingStorage,
                        usedPercentage: Math.round((currentStorageUsed / newSubscription.storageLimit) * 100),
                    },
                    photos: {
                        used: currentPhotosCount,
                        limit: newSubscription.maxPhotos,
                        remaining: remainingPhotos,
                        usedPercentage: Math.round((currentPhotosCount / newSubscription.maxPhotos) * 100),
                    },
                    aiChat: {
                        monthlyMessages: {
                            used: totalAIMessages,
                            limit: aiLimits.monthlyMessages,
                            remaining: remainingAIMessages,
                            usedPercentage: Math.round((totalAIMessages / aiLimits.monthlyMessages) * 100),
                        },
                        coachSessions: {
                            used: aiChatSessions.filter((s) => s.coachType && s.coachType !== "general").length,
                            limit: aiLimits.monthlyCoachSessions,
                            remaining: Math.max(0, aiLimits.monthlyCoachSessions -
                                aiChatSessions.filter((s) => s.coachType && s.coachType !== "general").length),
                        },
                    },
                },
            });
            return;
        }
        console.log(`Subscription found for user: ${decodedToken.id}`, {
            planType: subscription.planType,
            isActive: subscription.isActive,
            isExpired: subscription.isExpired(),
        });
        // Kullanım detaylarını hesapla
        const currentStorageUsed = (storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.totalStorageUsed) || 0;
        const currentPhotosCount = (storageUsage === null || storageUsage === void 0 ? void 0 : storageUsage.photosCount) || 0;
        const remainingPhotos = Math.max(0, subscription.maxPhotos - currentPhotosCount);
        const remainingStorage = Math.max(0, subscription.storageLimit - currentStorageUsed);
        // AI kullanım limitlerini plan tipine göre belirle
        const aiLimits = getAILimits(subscription.planType);
        const remainingAIMessages = Math.max(0, aiLimits.monthlyMessages - totalAIMessages);
        res.status(200).json({
            message: "Subscription retrieved successfully",
            subscription: {
                id: subscription._id,
                planType: subscription.planType,
                storageLimit: subscription.storageLimit,
                maxPhotos: subscription.maxPhotos,
                isActive: subscription.isActive,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                autoRenew: subscription.autoRenew,
                price: subscription.price,
                currency: subscription.currency,
                paymentMethod: subscription.paymentMethod,
                lastPaymentDate: subscription.lastPaymentDate,
                nextPaymentDate: subscription.nextPaymentDate,
                isExpired: subscription.isExpired(),
                daysUntilExpiry: subscription.daysUntilExpiry(),
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt,
            },
            usage: {
                storage: {
                    used: currentStorageUsed,
                    limit: subscription.storageLimit,
                    remaining: remainingStorage,
                    usedPercentage: Math.round((currentStorageUsed / subscription.storageLimit) * 100),
                },
                photos: {
                    used: currentPhotosCount,
                    limit: subscription.maxPhotos,
                    remaining: remainingPhotos,
                    usedPercentage: Math.round((currentPhotosCount / subscription.maxPhotos) * 100),
                },
                aiChat: {
                    monthlyMessages: {
                        used: totalAIMessages,
                        limit: aiLimits.monthlyMessages,
                        remaining: remainingAIMessages,
                        usedPercentage: Math.round((totalAIMessages / aiLimits.monthlyMessages) * 100),
                    },
                    coachSessions: {
                        used: aiChatSessions.filter((s) => s.coachType && s.coachType !== "general").length,
                        limit: aiLimits.monthlyCoachSessions,
                        remaining: Math.max(0, aiLimits.monthlyCoachSessions -
                            aiChatSessions.filter((s) => s.coachType && s.coachType !== "general").length),
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error getting user subscription:", {
            error: (error === null || error === void 0 ? void 0 : error.message) || "Unknown error",
            stack: error === null || error === void 0 ? void 0 : error.stack,
            timestamp: new Date().toISOString(),
        });
        next(new common_1.BadRequestError("Failed to get subscription"));
        return;
    }
});
exports.getUserSubscription = getUserSubscription;
// Helper function to get AI limits based on plan type
function getAILimits(planType) {
    const limits = {
        free: {
            monthlyMessages: 20,
            monthlyCoachSessions: 5,
        },
        premium: {
            monthlyMessages: 200,
            monthlyCoachSessions: 50,
        },
        premium_plus: {
            monthlyMessages: 1000,
            monthlyCoachSessions: 200,
        },
    };
    return limits[planType] || limits.free;
}
exports.default = exports.getUserSubscription;
