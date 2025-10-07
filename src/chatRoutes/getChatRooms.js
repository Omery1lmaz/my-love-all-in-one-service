"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatRoomsRouter = void 0;
const express_1 = __importDefault(require("express"));
const getChatRooms_1 = require("../chatControllers/getChatRooms");
const common_1 = require("@heaven-nsoft/common");
const router = express_1.default.Router();
exports.getChatRoomsRouter = router;
router.get("/chat-rooms", common_1.requireAuth, getChatRooms_1.getChatRooms);
