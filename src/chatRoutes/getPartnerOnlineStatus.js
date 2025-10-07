"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerOnlineStatusRouter = void 0;
const express_1 = __importDefault(require("express"));
const getPartnerOnlineStatus_1 = require("../chatControllers/getPartnerOnlineStatus");
const common_1 = require("@heaven-nsoft/common");
const router = express_1.default.Router();
exports.getPartnerOnlineStatusRouter = router;
router.get("/partner-online-status", common_1.requireAuth, getPartnerOnlineStatus_1.getPartnerOnlineStatus);
