"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const sendMessage_1 = require("../chatControllers/sendMessage");
const common_1 = require("@heaven-nsoft/common");
const router = express_1.default.Router();
exports.sendMessageRouter = router;
router.post("/send-message", [
    (0, express_validator_1.body)("receiverId")
        .isMongoId()
        .withMessage("Receiver ID must be a valid MongoDB ID"),
    (0, express_validator_1.body)("content")
        .trim()
        .notEmpty()
        .withMessage("Message content is required")
        .isLength({ max: 1000 })
        .withMessage("Message content must be less than 1000 characters"),
    (0, express_validator_1.body)("messageType")
        .optional()
        .isIn(["text", "image", "audio", "video", "file"])
        .withMessage("Invalid message type"),
    (0, express_validator_1.body)("mediaUrl")
        .optional()
        .isURL()
        .withMessage("Media URL must be a valid URL")
], common_1.validateRequest, sendMessage_1.sendMessage);
