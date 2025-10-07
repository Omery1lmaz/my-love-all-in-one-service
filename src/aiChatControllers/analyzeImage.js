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
exports.analyzeImage = void 0;
const aiClient_1 = require("../utils/aiClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const analyzeImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { imageUrl, prompt } = req.body;
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
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            res.status(401).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        if (!imageUrl) {
            res.status(400).json({ message: "Analiz edilecek görsel URL'si gereklidir" });
            return;
        }
        // Google AI ile görsel analizi
        const analysisResult = yield (0, aiClient_1.analyzeImageWithGoogleAI)({
            imageUrl,
            prompt: prompt || "Bu görselde ne görüyorsun? Detaylı olarak açıkla."
        });
        if (analysisResult.status === "error") {
            res.status(500).json({
                message: "Görsel analizi başarısız",
                error: analysisResult.error
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                imageUrl,
                prompt: prompt || "Bu görselde ne görüyorsun? Detaylı olarak açıkla.",
                result: analysisResult.result,
                timestamp: new Date(),
            },
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.analyzeImage = analyzeImage;
