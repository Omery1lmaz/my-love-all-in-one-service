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
exports.createChatSession = void 0;
const aiChat_1 = require("../Models/aiChat");
const uuid_1 = require("uuid");
const aiClient_1 = require("../utils/aiClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const createChatSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { title, coachType = "general", coachId } = req.body;
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
        // Ensure user has a subscription (create default if not exists)
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`Subscription verified/created for AI chat session creation - user: ${decodedToken.id}`, {
                subscriptionId: userSubscription._id,
                planType: userSubscription.planType,
                isActive: userSubscription.isActive,
            });
            // Double check that subscription is active
            if (!userSubscription.isActive) {
                console.warn(`Subscription found but inactive for user: ${decodedToken.id}, activating...`);
                userSubscription.isActive = true;
                yield userSubscription.save();
                console.log(`Subscription activated for user: ${decodedToken.id}`);
            }
        }
        catch (error) {
            console.error(`Error with subscription for AI chat session creation - user ${decodedToken.id}:`, error);
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can create more AI chat sessions (basic check)
        const existingSessions = yield aiChat_1.AIChatSession.countDocuments({
            userId: new mongoose_1.default.Types.ObjectId(decodedToken.id),
            isActive: true,
        });
        // Basic AI chat session limit check (can be enhanced based on plan)
        const maxSessions = userSubscription.planType === "free"
            ? 3
            : userSubscription.planType === "premium"
                ? 10
                : 50;
        if (existingSessions >= maxSessions) {
            console.error(`AI chat session limit exceeded for user: ${decodedToken.id}`, {
                existingSessions,
                maxSessions,
                planType: userSubscription.planType,
            });
            res.status(400).json({
                message: `AI sohbet session limiti aşıldı. Mevcut planınızla ${maxSessions} AI sohbet session'ı oluşturabilirsiniz.`,
            });
            return;
        }
        // Koç türü kontrolü
        const validCoachTypes = [
            "general",
            "relationship_coach",
            "career_coach",
            "health_coach",
            "personal_development_coach",
            "financial_coach",
        ];
        if (!validCoachTypes.includes(coachType)) {
            res.status(400).json({ message: "Geçersiz koç türü" });
            return;
        }
        // Eğer koç ID'si verilmişse, geçerli olup olmadığını kontrol et
        if (coachId && !Object.values(aiClient_1.LIFE_COACHES).find((c) => c.id === coachId)) {
            res.status(400).json({ message: "Geçersiz koç ID'si test deneme" });
            return;
        }
        // Session ID oluştur
        const sessionId = (0, uuid_1.v4)();
        // Varsayılan başlık belirle
        let sessionTitle = title || "Yeni Sohbet";
        // Eğer koç türü belirtilmişse, koç adını başlığa ekle
        if (coachType !== "general" && coachId) {
            const coach = Object.values(aiClient_1.LIFE_COACHES).find((c) => c.id === coachId);
            if (coach) {
                sessionTitle = `${coach.name} ile Sohbet`;
            }
        }
        // Yeni session oluştur
        const newSession = aiChat_1.AIChatSession.build({
            userId: user._id,
            sessionId,
            title: sessionTitle,
            messages: [],
            isActive: true,
            coachType,
            coachId: coachId || null,
        });
        yield newSession.save();
        res.status(201).json({
            success: true,
            data: {
                sessionId: newSession.sessionId,
                title: newSession.title,
                coachType: newSession.coachType,
                coachId: newSession.coachId,
                messageCount: 0,
                createdAt: newSession.createdAt,
            },
            subscriptionInfo: {
                planType: userSubscription.planType,
                remainingSessions: maxSessions - (existingSessions + 1),
                maxSessions: maxSessions,
            },
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.createChatSession = createChatSession;
