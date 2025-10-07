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
exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    planType: {
        type: String,
        enum: ["free", "premium", "premium_plus"],
        default: "free",
        required: true
    },
    storageLimit: {
        type: Number,
        required: true,
        default: 1024 * 1024 * 100 // 100MB for free plan
    },
    maxPhotos: {
        type: Number,
        required: true,
        default: 50 // 50 photos for free plan
    },
    startDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number
    },
    currency: {
        type: String,
        default: "USD"
    },
    paymentMethod: {
        type: String
    },
    lastPaymentDate: {
        type: Date
    },
    nextPaymentDate: {
        type: Date
    },
}, { timestamps: true });
// Method to check if subscription is expired
subscriptionSchema.methods.isExpired = function () {
    if (!this.endDate)
        return false;
    return new Date() > this.endDate;
};
// Method to get days until expiry
subscriptionSchema.methods.daysUntilExpiry = function () {
    if (!this.endDate)
        return Infinity;
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};
// Static method to get or create default subscription
subscriptionSchema.statics.getDefaultSubscription = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let subscription = yield this.findOne({ user: userId });
        if (!subscription) {
            subscription = yield this.create({
                user: userId,
                planType: "free",
                storageLimit: 1024 * 1024 * 100, // 100MB
                maxPhotos: 50,
                isActive: true
            });
        }
        return subscription;
    });
};
// Static method to get active subscription
subscriptionSchema.statics.getActiveSubscription = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const subscription = yield this.findOne({
            user: userId,
            isActive: true
        });
        if (subscription && subscription.isExpired()) {
            // Deactivate expired subscription
            subscription.isActive = false;
            yield subscription.save();
            return null;
        }
        return subscription;
    });
};
subscriptionSchema.statics.build = (attrs) => {
    return new (mongoose_1.default.model("Subscription", subscriptionSchema))(attrs);
};
// Static method to upgrade plan
subscriptionSchema.statics.upgradePlan = function (userId, newPlanType) {
    return __awaiter(this, void 0, void 0, function* () {
        const subscription = yield this.findOne({ user: userId });
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        const planDetails = getPlanDetails(newPlanType);
        subscription.planType = newPlanType;
        subscription.storageLimit = planDetails.storageLimit;
        subscription.maxPhotos = planDetails.maxPhotos;
        subscription.price = planDetails.price;
        subscription.currency = planDetails.currency;
        subscription.isActive = true;
        // Set end date for paid plans
        if (newPlanType !== 'free') {
            const newEndDate = new Date();
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            subscription.endDate = newEndDate;
            subscription.nextPaymentDate = newEndDate;
        }
        yield subscription.save();
        return subscription;
    });
};
// Static method to downgrade to free plan
subscriptionSchema.statics.downgradeToFree = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const subscription = yield this.findOne({ user: userId });
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        subscription.planType = "free";
        subscription.storageLimit = 1024 * 1024 * 100; // 100MB
        subscription.maxPhotos = 50;
        subscription.price = 0;
        subscription.isActive = true;
        subscription.autoRenew = false;
        subscription.endDate = undefined;
        subscription.nextPaymentDate = undefined;
        subscription.paymentMethod = undefined;
        yield subscription.save();
        return subscription;
    });
};
// Helper function to get plan details
function getPlanDetails(planType) {
    const plans = {
        free: {
            storageLimit: 1024 * 1024 * 100, // 100MB
            maxPhotos: 50,
            price: 0,
            currency: "USD"
        },
        premium: {
            storageLimit: 1024 * 1024 * 1024 * 5, // 5GB
            maxPhotos: 1000,
            price: 9.99,
            currency: "USD"
        },
        premium_plus: {
            storageLimit: 1024 * 1024 * 1024 * 50, // 50GB
            maxPhotos: 10000,
            price: 19.99,
            currency: "USD"
        }
    };
    return plans[planType] || plans.free;
}
const Subscription = mongoose_1.default.model("Subscription", subscriptionSchema);
exports.Subscription = Subscription;
