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
exports.LIMIT_CONFIGS = exports.LimitService = void 0;
const user_1 = require("../Models/user");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
class LimitService {
    /**
     * Kullanıcının belirli bir işlem için limit kontrolü yapar
     * @param userId Kullanıcı ID'si
     * @param currentCount Mevcut kullanım sayısı
     * @param limitConfig Plan bazlı limitler
     * @param operationName İşlem adı (event, album, journal, etc.)
     * @returns Limit kontrol sonucu
     */
    static checkLimit(userId, currentCount, limitConfig, operationName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Kullanıcının subscription'ını al
                const userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(userId));
                // Plan tipine göre limit belirle
                const limit = limitConfig[userSubscription.planType];
                // Limit kontrolü
                if (currentCount >= limit) {
                    // AdSense kullanabilirlik kontrolü
                    const adsenseAvailable = yield this.checkAdSenseAvailability(userId);
                    return {
                        canProceed: false,
                        reason: `${operationName} limiti aşıldı`,
                        adsenseAvailable,
                        adsenseMessage: adsenseAvailable
                            ? `AdSense izleyerek ${operationName} oluşturabilirsiniz.`
                            : undefined,
                        upgradeMessage: `Mevcut planınızla ${limit} ${operationName} oluşturabilirsiniz. Premium plana geçerek limitinizi artırabilirsiniz.`,
                        currentUsage: currentCount,
                        limit,
                        planType: userSubscription.planType
                    };
                }
                return {
                    canProceed: true,
                    currentUsage: currentCount,
                    limit,
                    planType: userSubscription.planType
                };
            }
            catch (error) {
                console.error("Limit check error:", error);
                return {
                    canProceed: false,
                    reason: "Limit kontrolü yapılamadı"
                };
            }
        });
    }
    /**
     * Kullanıcının AdSense kullanabilirliğini kontrol eder
     * @param userId Kullanıcı ID'si
     * @returns AdSense kullanabilirlik durumu
     */
    static checkAdSenseAvailability(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user) {
                    return false;
                }
                // AdSense kullanabilirlik kriterleri:
                // 1. Kullanıcı aktif olmalı
                // 2. Belirli bir süre geçmiş olmalı (örn: 24 saat)
                // 3. Daha önce AdSense kullanmamış olmalı (günlük limit)
                const now = new Date();
                const lastAdSenseUse = user.lastAdSenseUse || new Date(0);
                const hoursSinceLastUse = (now.getTime() - lastAdSenseUse.getTime()) / (1000 * 60 * 60);
                // 24 saat geçmişse AdSense kullanabilir
                const canUseAdSense = hoursSinceLastUse >= 24;
                // Günlük AdSense limiti kontrolü (örn: günde 3 kez)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayAdSenseCount = user.dailyAdSenseCount || 0;
                const dailyAdSenseLimit = 3; // Günde maksimum 3 kez AdSense kullanabilir
                const withinDailyLimit = todayAdSenseCount < dailyAdSenseLimit;
                return canUseAdSense && withinDailyLimit;
            }
            catch (error) {
                console.error("AdSense availability check error:", error);
                return false;
            }
        });
    }
    /**
     * Kullanıcının AdSense kullanımını kaydeder
     * @param userId Kullanıcı ID'si
     * @param operationName İşlem adı
     */
    static recordAdSenseUsage(userId, operationName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user) {
                    return;
                }
                // Son AdSense kullanım zamanını güncelle
                user.lastAdSenseUse = new Date();
                // Günlük AdSense sayacını artır
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const lastAdSenseDate = user.lastAdSenseDate || new Date(0);
                if (lastAdSenseDate.getTime() < today.getTime()) {
                    // Yeni gün, sayacı sıfırla
                    user.dailyAdSenseCount = 1;
                    user.lastAdSenseDate = today;
                }
                else {
                    // Aynı gün, sayacı artır
                    user.dailyAdSenseCount = (user.dailyAdSenseCount || 0) + 1;
                }
                yield user.save();
                console.log(`AdSense usage recorded for user ${userId}, operation: ${operationName}`);
            }
            catch (error) {
                console.error("AdSense usage recording error:", error);
            }
        });
    }
    /**
     * Limit aşımı için standart response oluşturur
     * @param limitResult Limit kontrol sonucu
     * @param operationName İşlem adı
     * @returns Standart response objesi
     */
    static createLimitExceededResponse(limitResult, operationName) {
        const response = {
            message: limitResult.reason || `${operationName} limiti aşıldı`,
            error: "LIMIT_EXCEEDED",
            currentUsage: limitResult.currentUsage,
            limit: limitResult.limit,
            planType: limitResult.planType,
            upgradeMessage: limitResult.upgradeMessage
        };
        // AdSense seçeneği varsa ekle
        if (limitResult.adsenseAvailable) {
            response.adsenseOption = {
                available: true,
                message: limitResult.adsenseMessage,
                action: "watch_ad_to_proceed",
                endpoint: `/adsense/consume/${operationName}`
            };
        }
        return response;
    }
}
exports.LimitService = LimitService;
// Yaygın kullanılan limit konfigürasyonları
exports.LIMIT_CONFIGS = {
    EVENTS: {
        free: 10,
        premium: 100,
        premium_plus: 500
    },
    ALBUMS: {
        free: 5,
        premium: 50,
        premium_plus: 200
    },
    JOURNALS: {
        free: 30,
        premium: 365,
        premium_plus: 1000
    },
    TIMELINES: {
        free: 20,
        premium: 100,
        premium_plus: 500
    },
    AI_MESSAGES: {
        free: 20,
        premium: 200,
        premium_plus: 1000
    },
    COACH_SESSIONS: {
        free: 5,
        premium: 50,
        premium_plus: 200
    }
};
