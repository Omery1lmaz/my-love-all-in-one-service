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
exports.getAvailablePlans = void 0;
const common_1 = require("@heaven-nsoft/common");
const getAvailablePlans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getAvailablePlans controller started");
        const plans = {
            free: {
                name: "Free Plan",
                planType: "free",
                storageLimit: 1024 * 1024 * 100, // 100MB
                maxPhotos: 50,
                price: 0,
                currency: "USD",
                features: [
                    "100MB storage",
                    "Up to 50 photos",
                    "Basic photo management",
                    "Standard support"
                ],
                limitations: [
                    "Limited storage space",
                    "Limited photo count",
                    "No priority support"
                ]
            },
            premium: {
                name: "Premium Plan",
                planType: "premium",
                storageLimit: 1024 * 1024 * 1024 * 5, // 5GB
                maxPhotos: 1000,
                price: 9.99,
                currency: "USD",
                features: [
                    "5GB storage",
                    "Up to 1000 photos",
                    "Advanced photo management",
                    "Priority support",
                    "High-quality thumbnails",
                    "Photo organization tools"
                ],
                limitations: [
                    "Monthly subscription required",
                    "Limited to 1000 photos"
                ]
            },
            premium_plus: {
                name: "Premium Plus Plan",
                planType: "premium_plus",
                storageLimit: 1024 * 1024 * 1024 * 50, // 50GB
                maxPhotos: 10000,
                price: 19.99,
                currency: "USD",
                features: [
                    "50GB storage",
                    "Up to 10,000 photos",
                    "Advanced photo management",
                    "Priority support",
                    "High-quality thumbnails",
                    "Photo organization tools",
                    "Bulk operations",
                    "Advanced analytics",
                    "API access"
                ],
                limitations: [
                    "Monthly subscription required"
                ]
            }
        };
        // Storage limitleri human readable format'a çevir
        const formattedPlans = Object.values(plans).map(plan => (Object.assign(Object.assign({}, plan), { storageLimitFormatted: formatBytes(plan.storageLimit), storageLimitBytes: plan.storageLimit })));
        console.log(formattedPlans, "formattedPlans");
        console.log("Available plans retrieved successfully");
        res.status(200).json({
            message: "Available plans retrieved successfully",
            plans: formattedPlans,
            currentCurrency: "USD",
            billingCycle: "monthly"
        });
    }
    catch (error) {
        console.error("Error getting available plans:", {
            error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
            stack: error === null || error === void 0 ? void 0 : error.stack,
            timestamp: new Date().toISOString()
        });
        next(new common_1.BadRequestError("Failed to get available plans"));
    }
});
exports.getAvailablePlans = getAvailablePlans;
// Bytes'ı human readable format'a çeviren helper fonksiyon
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
exports.default = exports.getAvailablePlans;
