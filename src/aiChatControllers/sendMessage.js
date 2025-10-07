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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageStream = exports.sendMessage = void 0;
const aiChat_1 = require("../Models/aiChat");
const aiClient_1 = require("../utils/aiClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const subscription_1 = require("../Models/subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] [${requestId}] AI Chat sendMessage started`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        body: {
            sessionId: (_a = req.body) === null || _a === void 0 ? void 0 : _a.sessionId,
            messageLength: (_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.length,
        },
    });
    const authHeader = req.headers.authorization;
    const { sessionId, message } = req.body;
    if (!authHeader) {
        console.log(`[${new Date().toISOString()}] [${requestId}] Authentication failed: no authHeader`);
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log(`[${new Date().toISOString()}] [${requestId}] Authentication failed: no token`);
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        console.log(`[${new Date().toISOString()}] [${requestId}] Verifying JWT token`);
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        console.log(`[${new Date().toISOString()}] [${requestId}] JWT token verified successfully`, {
            userId: decodedToken.id,
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] Fetching user from database`);
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            console.log(`[${new Date().toISOString()}] [${requestId}] User not found in database`, {
                userId: decodedToken.id,
            });
            res.status(401).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        console.log(`[${new Date().toISOString()}] [${requestId}] User found successfully`, {
            userId: user._id,
            email: user.email,
        });
        // Ensure user has a subscription (create default if not exists)
        console.log(`[${new Date().toISOString()}] [${requestId}] Ensuring subscription exists for AI chat`, {
            userId: decodedToken.id,
        });
        let userSubscription;
        try {
            console.log(`[${new Date().toISOString()}] [${requestId}] Getting/creating default subscription`);
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`[${new Date().toISOString()}] [${requestId}] Subscription verified/created for AI chat`, {
                userId: decodedToken.id,
                subscriptionId: userSubscription._id,
                planType: userSubscription.planType,
                isActive: userSubscription.isActive,
            });
            // Double check that subscription is active
            if (!userSubscription.isActive) {
                console.warn(`[${new Date().toISOString()}] [${requestId}] Subscription found but inactive, activating...`, {
                    userId: decodedToken.id,
                    subscriptionId: userSubscription._id,
                });
                userSubscription.isActive = true;
                yield userSubscription.save();
                console.log(`[${new Date().toISOString()}] [${requestId}] Subscription activated successfully`, {
                    userId: decodedToken.id,
                    subscriptionId: userSubscription._id,
                });
            }
        }
        catch (error) {
            console.error(`[${new Date().toISOString()}] [${requestId}] Error with subscription for AI chat`, {
                userId: decodedToken.id,
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can send more AI messages (basic check)
        const existingAIMessages = yield aiChat_1.AIChatSession.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(decodedToken.id) } },
            { $unwind: "$messages" },
            { $match: { "messages.role": "user" } },
            { $count: "totalMessages" },
        ]);
        const messageCount = existingAIMessages.length > 0 ? existingAIMessages[0].totalMessages : 0;
        // Basic AI message limit check (can be enhanced based on plan)
        const maxAIMessages = userSubscription.planType === "free"
            ? 20
            : userSubscription.planType === "premium"
                ? 100
                : 500;
        if (messageCount >= maxAIMessages) {
            console.error(`[${new Date().toISOString()}] [${requestId}] AI message limit exceeded`, {
                userId: decodedToken.id,
                messageCount,
                maxAIMessages,
                planType: userSubscription.planType,
            });
            res.status(400).json({
                message: `AI sohbet limiti aşıldı. Mevcut planınızla ${maxAIMessages} AI mesajı gönderebilirsiniz.`,
            });
            return;
        }
        if (!sessionId || !message) {
            res.status(400).json({ message: "Session ID ve mesaj gereklidir" });
            return;
        }
        // Session'ı bul
        const session = yield aiChat_1.AIChatSession.findOne({
            sessionId,
            userId: user._id,
            isActive: true,
        });
        if (!session) {
            res.status(404).json({ message: "Chat session bulunamadı" });
            return;
        }
        // Kullanıcı mesajını ekle
        console.log(`[${new Date().toISOString()}] [${requestId}] Adding user message to session`);
        session.messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });
        // AI yanıtını al
        let aiResponse = "";
        try {
            // Konuşma geçmişini hazırla (son 10 mesaj)
            const conversationHistory = session.messages.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            console.log(`[${new Date().toISOString()}] [${requestId}] Preparing AI request`, {
                coachType: session.coachType,
                coachId: session.coachId,
                conversationHistoryLength: conversationHistory.length,
                messageLength: message.length,
            });
            // Koç türüne göre farklı AI fonksiyonlarını kullan
            if (session.coachType &&
                session.coachType !== "general" &&
                session.coachId) {
                // Yaşam koçu ile sohbet - Google AI kullan
                console.log(`[${new Date().toISOString()}] [${requestId}] Using life coach AI`, {
                    coachId: session.coachId,
                    coachType: session.coachType,
                });
                const aiResult = yield (0, aiClient_1.chatWithGoogleLifeCoach)({
                    message,
                    coachId: session.coachId,
                    conversationHistory,
                });
                aiResponse = aiResult.response;
                console.log(`[${new Date().toISOString()}] [${requestId}] Life coach AI response received`, {
                    responseLength: aiResponse.length,
                    response: aiResult.response,
                });
            }
            else {
                // Genel AI sohbet - Google AI kullan
                console.log(`[${new Date().toISOString()}] [${requestId}] Using general AI`);
                const aiResult = yield (0, aiClient_1.chatWithGoogleAI)({
                    message,
                    conversationHistory,
                });
                aiResponse = aiResult.response;
                console.log(`[${new Date().toISOString()}] [${requestId}] General AI response received`, {
                    responseLength: aiResponse.length,
                });
            }
        }
        catch (aiError) {
            console.error(`[${new Date().toISOString()}] [${requestId}] AI response error`, {
                error: aiError instanceof Error ? aiError.message : aiError,
                stack: aiError instanceof Error ? aiError.stack : undefined,
                coachType: session.coachType,
                coachId: session.coachId,
            });
            aiResponse =
                "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
        }
        // AI yanıtını ekle
        console.log(`[${new Date().toISOString()}] [${requestId}] Adding AI response to session`);
        session.messages.push({
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
        });
        // Session'ı güncelle
        session.updatedAt = new Date();
        console.log(`[${new Date().toISOString()}] [${requestId}] Saving AI chat session to database`);
        yield session.save();
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        console.log(`[${new Date().toISOString()}] [${requestId}] AI message sent successfully`, {
            userId: decodedToken.id,
            sessionId: session.sessionId,
            messageCount: session.messages.length,
            planType: userSubscription.planType,
            remainingAIMessages: maxAIMessages - (messageCount + 1),
            processingTimeMs: processingTime,
            aiResponseLength: aiResponse.length,
        });
        res.status(200).json({
            success: true,
            data: {
                sessionId: session.sessionId,
                message: {
                    role: "assistant",
                    content: aiResponse,
                    timestamp: new Date(),
                },
                messageCount: session.messages.length,
                coachType: session.coachType,
                coachId: session.coachId,
            },
            subscriptionInfo: {
                planType: userSubscription.planType,
                remainingAIMessages: maxAIMessages - (messageCount + 1),
                maxAIMessages: maxAIMessages,
            },
        });
    }
    catch (error) {
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        console.error(`[${new Date().toISOString()}] [${requestId}] Error in sendMessage`, {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            processingTimeMs: processingTime,
            requestBody: {
                sessionId: (_d = req.body) === null || _d === void 0 ? void 0 : _d.sessionId,
                messageLength: (_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.length,
            },
        });
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.sendMessage = sendMessage;
const sendMessageStream = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c, _d, e_2, _e, _f;
    var _g, _h, _j, _k, _l, _m;
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] [${requestId}] AI Chat sendMessageStream started`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        body: {
            sessionId: (_g = req.body) === null || _g === void 0 ? void 0 : _g.sessionId,
            messageLength: (_j = (_h = req.body) === null || _h === void 0 ? void 0 : _h.message) === null || _j === void 0 ? void 0 : _j.length,
        },
    });
    const authHeader = req.headers.authorization;
    const { sessionId, message } = req.body;
    if (!authHeader) {
        console.log(`[${new Date().toISOString()}] [${requestId}] Authentication failed: no authHeader`);
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log(`[${new Date().toISOString()}] [${requestId}] Authentication failed: no token`);
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        console.log(`[${new Date().toISOString()}] [${requestId}] Verifying JWT token for streaming`);
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        console.log(`[${new Date().toISOString()}] [${requestId}] JWT token verified successfully for streaming`, {
            userId: decodedToken.id,
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] Fetching user from database for streaming`);
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            console.log(`[${new Date().toISOString()}] [${requestId}] User not found in database for streaming`, {
                userId: decodedToken.id,
            });
            res.status(401).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        console.log(`[${new Date().toISOString()}] [${requestId}] User found successfully for streaming`, {
            userId: user._id,
            email: user.email,
        });
        // Ensure user has a subscription (create default if not exists)
        console.log(`[${new Date().toISOString()}] [${requestId}] Ensuring subscription exists for AI chat streaming`, {
            userId: decodedToken.id,
        });
        let userSubscription;
        try {
            console.log(`[${new Date().toISOString()}] [${requestId}] Getting/creating default subscription for streaming`);
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`[${new Date().toISOString()}] [${requestId}] Subscription verified/created for AI chat streaming`, {
                userId: decodedToken.id,
                subscriptionId: userSubscription._id,
                planType: userSubscription.planType,
                isActive: userSubscription.isActive,
            });
            // Double check that subscription is active
            if (!userSubscription.isActive) {
                console.warn(`[${new Date().toISOString()}] [${requestId}] Subscription found but inactive for streaming, activating...`, {
                    userId: decodedToken.id,
                    subscriptionId: userSubscription._id,
                });
                userSubscription.isActive = true;
                yield userSubscription.save();
                console.log(`[${new Date().toISOString()}] [${requestId}] Subscription activated successfully for streaming`, {
                    userId: decodedToken.id,
                    subscriptionId: userSubscription._id,
                });
            }
        }
        catch (error) {
            console.error(`[${new Date().toISOString()}] [${requestId}] Error with subscription for AI chat streaming`, {
                userId: decodedToken.id,
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can send more AI messages (basic check)
        console.log(`[${new Date().toISOString()}] [${requestId}] Checking AI message count for streaming`);
        const existingAIMessages = yield aiChat_1.AIChatSession.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(decodedToken.id) } },
            { $unwind: "$messages" },
            { $match: { "messages.role": "user" } },
            { $count: "totalMessages" },
        ]);
        const messageCount = existingAIMessages.length > 0 ? existingAIMessages[0].totalMessages : 0;
        console.log(`[${new Date().toISOString()}] [${requestId}] AI message count check completed for streaming`, {
            userId: decodedToken.id,
            messageCount,
            planType: userSubscription.planType,
        });
        // Basic AI message limit check (can be enhanced based on plan)
        const maxAIMessages = userSubscription.planType === "free"
            ? 20
            : userSubscription.planType === "premium"
                ? 100
                : 500;
        if (messageCount >= maxAIMessages) {
            console.error(`[${new Date().toISOString()}] [${requestId}] AI message limit exceeded for streaming`, {
                userId: decodedToken.id,
                messageCount,
                maxAIMessages,
                planType: userSubscription.planType,
            });
            res.status(400).json({
                message: `AI sohbet limiti aşıldı. Mevcut planınızla ${maxAIMessages} AI mesajı gönderebilirsiniz.`,
            });
            return;
        }
        console.log(`[${new Date().toISOString()}] [${requestId}] AI message streaming allowed`, {
            userId: decodedToken.id,
            messageCount,
            maxAIMessages,
            planType: userSubscription.planType,
        });
        console.log(`[${new Date().toISOString()}] [${requestId}] Validating request parameters for streaming`, {
            sessionId,
            messageLength: message === null || message === void 0 ? void 0 : message.length,
        });
        if (!sessionId || !message) {
            console.log(`[${new Date().toISOString()}] [${requestId}] Request validation failed for streaming: missing sessionId or message`);
            res.status(400).json({ message: "Session ID ve mesaj gereklidir" });
            return;
        }
        // Session'ı bul
        console.log(`[${new Date().toISOString()}] [${requestId}] Finding chat session for streaming`, {
            sessionId,
            userId: user._id,
        });
        const session = yield aiChat_1.AIChatSession.findOne({
            sessionId,
            userId: user._id,
            isActive: true,
        });
        if (!session) {
            res.status(404).json({ message: "Chat session bulunamadı" });
            return;
        }
        // Kullanıcı mesajını ekle
        session.messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });
        // Streaming response için headers ayarla
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Transfer-Encoding", "chunked");
        let fullResponse = "";
        let chunkCount = 0;
        try {
            // Konuşma geçmişini hazırla (son 10 mesaj)
            const conversationHistory = session.messages.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            // Koç türüne göre farklı AI fonksiyonlarını kullan
            if (session.coachType &&
                session.coachType !== "general" &&
                session.coachId) {
                try {
                    // Yaşam koçu ile streaming sohbet
                    for (var _o = true, _p = __asyncValues((0, aiClient_1.chatWithGoogleLifeCoachStream)({
                        message,
                        coachId: session.coachId,
                        conversationHistory,
                    })), _q; _q = yield _p.next(), _a = _q.done, !_a; _o = true) {
                        _c = _q.value;
                        _o = false;
                        const chunk = _c;
                        fullResponse += chunk;
                        res.write(chunk);
                        chunkCount++;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_o && !_a && (_b = _p.return)) yield _b.call(_p);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                try {
                    // Genel AI streaming sohbet
                    for (var _r = true, _s = __asyncValues((0, aiClient_1.chatWithGoogleAIStream)({
                        message,
                        conversationHistory,
                    })), _t; _t = yield _s.next(), _d = _t.done, !_d; _r = true) {
                        _f = _t.value;
                        _r = false;
                        const chunk = _f;
                        fullResponse += chunk;
                        res.write(chunk);
                        chunkCount++;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_r && !_d && (_e = _s.return)) yield _e.call(_s);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (aiError) {
            console.error(`[${new Date().toISOString()}] [${requestId}] AI streaming response error`, {
                error: aiError instanceof Error ? aiError.message : aiError,
                stack: aiError instanceof Error ? aiError.stack : undefined,
                coachType: session.coachType,
                coachId: session.coachId,
                chunkCount,
            });
            const errorMessage = "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
            fullResponse = errorMessage;
            res.write(errorMessage);
        }
        // AI yanıtını session'a ekle
        session.messages.push({
            role: "assistant",
            content: fullResponse,
            timestamp: new Date(),
        });
        // Session'ı güncelle
        session.updatedAt = new Date();
        yield session.save();
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        res.end();
    }
    catch (error) {
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        console.error(`[${new Date().toISOString()}] [${requestId}] Error in sendMessageStream`, {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            processingTimeMs: processingTime,
            requestBody: {
                sessionId: (_k = req.body) === null || _k === void 0 ? void 0 : _k.sessionId,
                messageLength: (_m = (_l = req.body) === null || _l === void 0 ? void 0 : _l.message) === null || _m === void 0 ? void 0 : _m.length,
            },
        });
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.sendMessageStream = sendMessageStream;
