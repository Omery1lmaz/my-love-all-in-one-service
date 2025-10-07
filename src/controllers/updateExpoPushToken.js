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
exports.updateExpoPushTokenController = void 0;
const user_1 = require("../Models/user");
const updateExpoPushTokenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { expoPushToken } = req.body;
        const userId = req.currentUser.id;
        if (!expoPushToken) {
            res.status(400).json({
                success: false,
                message: "Expo push token is required"
            });
            return;
        }
        // Kullanıcıyı bul ve push token'ı güncelle
        const user = yield user_1.User.findByIdAndUpdate(userId, { expoPushToken }, { new: true });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Expo push token updated successfully",
            data: {
                userId: user._id,
                expoPushToken: user.expoPushToken
            }
        });
    }
    catch (error) {
        console.error("Error updating expo push token:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.updateExpoPushTokenController = updateExpoPushTokenController;
