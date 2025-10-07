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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getPartnerTodayMoodController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
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
        if (!user.partnerId) {
            res.status(404).json({ message: "Partner bulunamadı" });
            return;
        }
        const partner = yield user_1.User.findById(user.partnerId);
        if (!partner) {
            res.status(404).json({ message: "Partner bulunamadı" });
            return;
        }
        // Bugünün başlangıcını ve sonunu hesapla
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Bugünün mood'unu bul
        const todayMood = (_a = partner.moodHistory) === null || _a === void 0 ? void 0 : _a.find((mood) => {
            const moodDate = new Date(mood.date);
            return moodDate >= today && moodDate < tomorrow;
        });
        res.status(200).json({
            message: "Bugünün mood'u başarıyla getirildi",
            status: "success",
            statusCode: 200,
            data: todayMood || null,
        });
    }
    catch (error) {
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.default = getPartnerTodayMoodController;
