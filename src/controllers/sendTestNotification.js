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
exports.sendTestNotificationController = void 0;
const user_1 = require("../Models/user");
const expoNotificationService_1 = require("../services/expoNotificationService");
const sendTestNotificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.currentUser.id;
        // Kullanıcıyı bul
        const user = yield user_1.User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        if (!user.expoPushToken) {
            res.status(400).json({
                success: false,
                message: "User does not have an expo push token. Please register your device first."
            });
            return;
        }
        // Test notification gönder
        const ticket = yield expoNotificationService_1.expoNotificationService.sendTestNotification(user.expoPushToken);
        if (!ticket) {
            res.status(500).json({
                success: false,
                message: "Failed to send test notification"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Test notification sent successfully",
            data: {
                ticket,
                expoPushToken: user.expoPushToken
            }
        });
    }
    catch (error) {
        console.error("Error sending test notification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.sendTestNotificationController = sendTestNotificationController;
