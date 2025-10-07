"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageRouter = void 0;
const express_1 = __importDefault(require("express"));
const deleteMessage_1 = require("../chatControllers/deleteMessage");
const common_1 = require("@heaven-nsoft/common");
const router = express_1.default.Router();
exports.deleteMessageRouter = router;
router.delete("/message/:messageId", common_1.requireAuth, deleteMessage_1.deleteMessage);
