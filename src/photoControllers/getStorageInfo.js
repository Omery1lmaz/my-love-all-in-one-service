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
exports.getStorageInfoController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@heaven-nsoft/common");
const storageService_1 = require("../services/storageService");
const mongoose_1 = __importDefault(require("mongoose"));
const getStorageInfoController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return next(new common_1.NotAuthorizedError());
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
            next(new common_1.NotAuthorizedError());
            return;
        }
        // Get user's storage information
        const storageInfo = yield storageService_1.StorageService.getUserStorageInfo(new mongoose_1.default.Schema.Types.ObjectId(decodedToken.id));
        res.status(200).json({
            message: "Storage info retrieved successfully",
            storageInfo: {
                usedStorage: storageService_1.StorageService.formatBytes(storageInfo.storageUsage.totalStorageUsed),
                totalStorage: storageService_1.StorageService.formatBytes(storageInfo.subscription.storageLimit),
                usedPhotos: storageInfo.storageUsage.photosCount,
                maxPhotos: storageInfo.subscription.maxPhotos,
                storagePercentage: storageInfo.storagePercentage.toFixed(1),
                photosPercentage: storageInfo.photosPercentage.toFixed(1),
                planType: storageInfo.subscription.planType,
                isExpired: storageInfo.subscription.isExpired(),
                daysUntilExpiry: storageInfo.subscription.daysUntilExpiry(),
                planDetails: storageService_1.StorageService.getStoragePlanDetails(storageInfo.subscription.planType)
            }
        });
    }
    catch (error) {
        console.error("Error getting storage info:", error);
        next(new Error("Internal server error"));
    }
});
exports.getStorageInfoController = getStorageInfoController;
exports.default = exports.getStorageInfoController;
