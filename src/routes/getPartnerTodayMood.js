"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerTodayMoodRouter = void 0;
const express_1 = __importDefault(require("express"));
const getPartnerTodayMood_1 = __importDefault(require("../controllers/getPartnerTodayMood"));
const router = express_1.default.Router();
exports.getPartnerTodayMoodRouter = router;
router.get("/partner/today-mood", getPartnerTodayMood_1.default);
