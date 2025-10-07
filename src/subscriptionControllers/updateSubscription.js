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
exports.updateSubscription = void 0;
const common_1 = require("@heaven-nsoft/common");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const updateSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("updateSubscription controller started");
        // Token doğrulama
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new common_1.NotAuthorizedError());
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (_a) {
            return next(new common_1.NotAuthorizedError());
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            return next(new common_1.BadRequestError("User ID not found"));
        }
        const { planType, autoRenew, paymentMethod, price, currency, endDate } = req.body;
        console.log(`Updating subscription for user: ${decodedToken.id}`, {
            planType,
            autoRenew,
            paymentMethod,
            price,
            currency,
            endDate,
            timestamp: new Date().toISOString()
        });
        // Kullanıcının mevcut subscription'ını bul
        console.log(`Looking for existing subscription for user: ${decodedToken.id}`);
        let subscription = yield subscription_1.Subscription.findOne({
            user: new mongoose_1.default.Types.ObjectId(decodedToken.id),
        });
        if (!subscription) {
            console.log(`No subscription found for user: ${decodedToken.id}, creating default first`);
            subscription = (yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id)));
            console.log(`Default subscription created for user: ${decodedToken.id}`, {
                subscriptionId: subscription === null || subscription === void 0 ? void 0 : subscription._id,
                planType: subscription === null || subscription === void 0 ? void 0 : subscription.planType
            });
        }
        else {
            console.log(`Existing subscription found for user: ${decodedToken.id}`, {
                subscriptionId: subscription._id,
                currentPlanType: subscription.planType,
                currentStorageLimit: subscription.storageLimit,
                currentMaxPhotos: subscription.maxPhotos,
                isActive: subscription.isActive
            });
        }
        // TypeScript için null check
        if (!subscription) {
            console.error(`Failed to create or find subscription for user: ${decodedToken.id}`);
            return next(new common_1.BadRequestError("Failed to create or find subscription"));
        }
        // Plan tipi değişikliği için storage limit ve max photos güncelle
        if (planType && planType !== subscription.planType) {
            console.log(`Plan change detected for user: ${decodedToken.id}`, {
                from: subscription.planType,
                to: planType,
                currentStorageLimit: subscription.storageLimit,
                currentMaxPhotos: subscription.maxPhotos
            });
            const planDetails = getPlanDetails(planType);
            console.log(`Plan details for ${planType}:`, {
                storageLimit: planDetails.storageLimit,
                maxPhotos: planDetails.maxPhotos,
                price: planDetails.price,
                currency: planDetails.currency
            });
            subscription.planType = planType;
            subscription.storageLimit = planDetails.storageLimit;
            subscription.maxPhotos = planDetails.maxPhotos;
            subscription.price = planDetails.price;
            subscription.currency = currency || planDetails.currency;
            // Eğer premium plana geçiyorsa end date ekle
            if (planType !== "free" && !subscription.endDate) {
                const newEndDate = new Date();
                newEndDate.setMonth(newEndDate.getMonth() + 1); // 1 ay sonra
                subscription.endDate = newEndDate;
                subscription.nextPaymentDate = newEndDate;
                console.log(`Premium plan end date set for user: ${decodedToken.id}`, {
                    endDate: newEndDate,
                    nextPaymentDate: newEndDate,
                    planType: planType
                });
            }
            else if (planType === "free") {
                // Free plan'a geçişte end date'i temizle
                subscription.endDate = undefined;
                subscription.nextPaymentDate = undefined;
                console.log(`Free plan transition - end dates cleared for user: ${decodedToken.id}`);
            }
            console.log(`Plan successfully upgraded to ${planType} for user: ${decodedToken.id}`, {
                newStorageLimit: subscription.storageLimit,
                newMaxPhotos: subscription.maxPhotos,
                newPrice: subscription.price,
                newCurrency: subscription.currency
            });
        }
        // Diğer alanları güncelle
        if (autoRenew !== undefined) {
            console.log(`Auto-renew setting updated for user: ${decodedToken.id}`, {
                from: subscription.autoRenew,
                to: autoRenew
            });
            subscription.autoRenew = autoRenew;
        }
        if (paymentMethod) {
            console.log(`Payment method updated for user: ${decodedToken.id}`, {
                from: subscription.paymentMethod,
                to: paymentMethod
            });
            subscription.paymentMethod = paymentMethod;
        }
        if (price !== undefined) {
            console.log(`Price updated for user: ${decodedToken.id}`, {
                from: subscription.price,
                to: price
            });
            subscription.price = price;
        }
        if (currency) {
            console.log(`Currency updated for user: ${decodedToken.id}`, {
                from: subscription.currency,
                to: currency
            });
            subscription.currency = currency;
        }
        if (endDate) {
            const newEndDate = new Date(endDate);
            console.log(`End date updated for user: ${decodedToken.id}`, {
                from: subscription.endDate,
                to: newEndDate
            });
            subscription.endDate = newEndDate;
        }
        // Subscription'ı kaydet
        console.log(`Saving subscription changes for user: ${decodedToken.id}`);
        yield subscription.save();
        console.log(`Subscription updated successfully for user: ${decodedToken.id}`, {
            subscriptionId: subscription._id,
            finalPlanType: subscription.planType,
            finalStorageLimit: subscription.storageLimit,
            finalMaxPhotos: subscription.maxPhotos,
            finalPrice: subscription.price,
            finalCurrency: subscription.currency,
            finalAutoRenew: subscription.autoRenew,
            finalEndDate: subscription.endDate,
            finalPaymentMethod: subscription.paymentMethod,
            isExpired: subscription.isExpired(),
            daysUntilExpiry: subscription.daysUntilExpiry()
        });
        res.status(200).json({
            message: "Subscription updated successfully",
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
            success: true,
        });
    }
    catch (error) {
        console.error("Error updating subscription:", {
            error: (error === null || error === void 0 ? void 0 : error.message) || "Unknown error",
            stack: error === null || error === void 0 ? void 0 : error.stack,
            timestamp: new Date().toISOString(),
        });
        next(new common_1.BadRequestError("Failed to update subscription"));
    }
});
exports.updateSubscription = updateSubscription;
// Plan detaylarını getiren helper fonksiyon
function getPlanDetails(planType) {
    const plans = {
        free: {
            storageLimit: 1024 * 1024 * 100, // 100MB
            maxPhotos: 50,
            price: 0,
            currency: "USD",
        },
        premium: {
            storageLimit: 1024 * 1024 * 1024 * 5, // 5GB
            maxPhotos: 1000,
            price: 9.99,
            currency: "USD",
        },
        premium_plus: {
            storageLimit: 1024 * 1024 * 1024 * 50, // 50GB
            maxPhotos: 10000,
            price: 19.99,
            currency: "USD",
        },
    };
    return plans[planType] || plans.free;
}
exports.default = exports.updateSubscription;
