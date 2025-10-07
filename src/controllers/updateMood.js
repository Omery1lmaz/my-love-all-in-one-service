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
const user_1 = require("../Models/user");
const expoNotificationService_1 = require("../services/expoNotificationService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const updateMoodController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { mood, note, activities } = req.body;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user) {
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        user.moodHistory = user.moodHistory || [];
        user.moodHistory.push({
            date: new Date(),
            mood,
            note,
            activities,
        });
        yield user.save();
        // Send push notification to partner if they have expo push token
        if (user.partnerId) {
            try {
                const partner = yield user_1.User.findById(user.partnerId);
                if (partner && partner.expoPushToken) {
                    const userName = user.nickname || user.name || 'Partner';
                    yield expoNotificationService_1.expoNotificationService.sendMoodUpdateNotification(partner.expoPushToken, userName, mood);
                    console.log('Push notification sent for mood update');
                }
            }
            catch (notificationError) {
                console.error('Error sending mood update notification:', notificationError);
                // Don't fail the mood update if notification fails
            }
        }
        res.status(200).json({
            message: "Mood başarıyla güncellendi",
            status: "success",
            statusCode: 200,
            data: user.moodHistory,
        });
    }
    catch (error) {
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.default = updateMoodController;
