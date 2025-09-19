import express from "express";
import { requireAuth, validateRequest } from "@heaven-nsoft/common";
import { createChatSession } from "../aiChatControllers/createChatSession";
import { getChatSessions } from "../aiChatControllers/getChatSessions";
import { getChatMessages } from "../aiChatControllers/getChatMessages";
import { sendMessage, sendMessageStream } from "../aiChatControllers/sendMessage";
import { deleteChatSession } from "../aiChatControllers/deleteChatSession";
import { updateChatSessionTitle } from "../aiChatControllers/updateChatSessionTitle";
import { getLifeCoaches } from "../aiChatControllers/getLifeCoaches";
import { getCoachSessions } from "../aiChatControllers/getCoachSessions";
import { createChatSessionValidator } from "../aiChatExpressValidators/createChatSession";
import { sendMessageValidator } from "../aiChatExpressValidators/sendMessage";
import { updateChatSessionTitleValidator } from "../aiChatExpressValidators/updateChatSessionTitle";
import { analyzeTextRouter } from "./analyzeText";
import { analyzeImageRouter } from "./analyzeImage";

const router = express.Router();

// Yaşam koçları
router.get("/coaches", getLifeCoaches);
router.get("/coaches/:coachId/sessions", getCoachSessions);

// Chat session'ları
router.post("/sessions", createChatSessionValidator, validateRequest, createChatSession);
router.get("/sessions", getChatSessions);
router.get("/sessions/:sessionId", getChatMessages);
router.put("/sessions/:sessionId/title", updateChatSessionTitleValidator, validateRequest, updateChatSessionTitle);
router.delete("/sessions/:sessionId", deleteChatSession);

// Mesaj gönderme
router.post("/sessions/:sessionId/messages", sendMessageValidator, validateRequest, sendMessage);
router.post("/sessions/:sessionId/messages/stream", sendMessageValidator, validateRequest, sendMessageStream);

// Google AI analiz özellikleri
router.use("/analyze", analyzeTextRouter);
router.use("/analyze", analyzeImageRouter);

export { router as aiChatRouter };
