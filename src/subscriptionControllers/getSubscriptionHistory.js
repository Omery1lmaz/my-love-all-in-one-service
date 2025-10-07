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
exports.getSubscriptionHistory = void 0;
const common_1 = require("@heaven-nsoft/common");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSubscriptionHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getSubscriptionHistory controller started");
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
        console.log(`Getting subscription history for user: ${decodedToken.id}`);
        // Kullanıcının mevcut subscription'ını getir
        const subscription = yield subscription_1.Subscription.findOne({
            user: new mongoose_1.default.Types.ObjectId(decodedToken.id),
        });
        if (!subscription) {
            return res.status(200).json({
                message: "No subscription history found",
                history: [],
                currentSubscription: null,
            });
        }
        // Subscription geçmişi oluştur (şimdilik sadece mevcut subscription)
        // Gerçek uygulamada ayrı bir SubscriptionHistory tablosu olabilir
        const history = [
            {
                id: subscription._id,
                planType: subscription.planType,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                price: subscription.price,
                currency: subscription.currency,
                paymentMethod: subscription.paymentMethod,
                lastPaymentDate: subscription.lastPaymentDate,
                status: subscription.isActive ? "active" : "inactive",
                isExpired: subscription.isExpired(),
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt,
            },
        ];
        console.log(`Subscription history retrieved for user: ${decodedToken.id}`);
        res.status(200).json({
            message: "Subscription history retrieved successfully",
            history: history,
            currentSubscription: {
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
        });
    }
    catch (error) {
        console.error("Error getting subscription history:", {
            error: (error === null || error === void 0 ? void 0 : error.message) || "Unknown error",
            stack: error === null || error === void 0 ? void 0 : error.stack,
            timestamp: new Date().toISOString(),
        });
        next(new common_1.BadRequestError("Failed to get subscription history"));
    }
});
exports.getSubscriptionHistory = getSubscriptionHistory;
exports.default = exports.getSubscriptionHistory;
