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
exports.getChatMessages = void 0;
const aiChat_1 = require("../Models/aiChat");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const getChatMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { sessionId } = req.params;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("no token");
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
        if (!sessionId) {
            res.status(400).json({ message: "Session ID gereklidir" });
            return;
        }
        const session = yield aiChat_1.AIChatSession.findOne({
            sessionId,
            userId: user._id,
            isActive: true
        }).select('sessionId title messages createdAt updatedAt');
        if (!session) {
            res.status(404).json({ message: "Chat session bulunamadı" });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                sessionId: session.sessionId,
                title: session.title,
                messages: session.messages,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                messageCount: session.messages.length,
            },
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.getChatMessages = getChatMessages;
