"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiChatRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const createChatSession_1 = require("../aiChatControllers/createChatSession");
const getChatSessions_1 = require("../aiChatControllers/getChatSessions");
const getChatMessages_1 = require("../aiChatControllers/getChatMessages");
const sendMessage_1 = require("../aiChatControllers/sendMessage");
const deleteChatSession_1 = require("../aiChatControllers/deleteChatSession");
const updateChatSessionTitle_1 = require("../aiChatControllers/updateChatSessionTitle");
const getLifeCoaches_1 = require("../aiChatControllers/getLifeCoaches");
const getCoachSessions_1 = require("../aiChatControllers/getCoachSessions");
const createChatSession_2 = require("../aiChatExpressValidators/createChatSession");
const sendMessage_2 = require("../aiChatExpressValidators/sendMessage");
const updateChatSessionTitle_2 = require("../aiChatExpressValidators/updateChatSessionTitle");
const router = express_1.default.Router();
exports.aiChatRouter = router;
// Yaşam koçları
router.get("/coaches", getLifeCoaches_1.getLifeCoaches);
router.get("/coaches/:coachId/sessions", getCoachSessions_1.getCoachSessions);
// Chat session'ları
router.post("/sessions", createChatSession_2.createChatSessionValidator, common_1.validateRequest, createChatSession_1.createChatSession);
router.get("/sessions", getChatSessions_1.getChatSessions);
router.get("/sessions/:sessionId", getChatMessages_1.getChatMessages);
router.put("/sessions/:sessionId/title", updateChatSessionTitle_2.updateChatSessionTitleValidator, common_1.validateRequest, updateChatSessionTitle_1.updateChatSessionTitle);
router.delete("/sessions/:sessionId", deleteChatSession_1.deleteChatSession);
// Mesaj gönderme
router.post("/sessions/:sessionId/messages", sendMessage_2.sendMessageValidator, common_1.validateRequest, sendMessage_1.sendMessage);
router.post("/sessions/:sessionId/messages/stream", sendMessage_2.sendMessageValidator, common_1.validateRequest, sendMessage_1.sendMessageStream);
