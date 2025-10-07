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
exports.cancelSubscription = void 0;
const common_1 = require("@heaven-nsoft/common");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cancelSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("cancelSubscription controller started");
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
        console.log(`Cancelling subscription for user: ${decodedToken.id}`);
        // Kullanıcının subscription'ını bul
        const subscription = yield subscription_1.Subscription.findOne({
            user: new mongoose_1.default.Types.ObjectId(decodedToken.id)
        });
        if (!subscription) {
            return next(new common_1.BadRequestError("No subscription found"));
        }
        // Free plan'a geçiş yap
        subscription.planType = "free";
        subscription.storageLimit = 1024 * 1024 * 100; // 100MB
        subscription.maxPhotos = 50;
        subscription.isActive = true; // Free plan her zaman aktif
        subscription.autoRenew = false;
        subscription.price = 0;
        subscription.endDate = undefined; // Free plan'da end date yok
        subscription.nextPaymentDate = undefined;
        subscription.paymentMethod = undefined;
        yield subscription.save();
        console.log(`Subscription cancelled and downgraded to free plan for user: ${decodedToken.id}`);
        res.status(200).json({
            message: "Subscription cancelled successfully. Downgraded to free plan.",
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
                updatedAt: subscription.updatedAt
            },
            note: "Your subscription has been cancelled. You now have access to the free plan features."
        });
    }
    catch (error) {
        console.error("Error cancelling subscription:", {
            error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
            stack: error === null || error === void 0 ? void 0 : error.stack,
            timestamp: new Date().toISOString()
        });
        next(new common_1.BadRequestError("Failed to cancel subscription"));
    }
});
exports.cancelSubscription = cancelSubscription;
exports.default = exports.cancelSubscription;
