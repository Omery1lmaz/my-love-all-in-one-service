"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesRouter = void 0;
const express_1 = __importDefault(require("express"));
const getMessages_1 = require("../chatControllers/getMessages");
const common_1 = require("@heaven-nsoft/common");
const router = express_1.default.Router();
exports.getMessagesRouter = router;
router.get("/messages/:partnerId", common_1.requireAuth, getMessages_1.getMessages);
