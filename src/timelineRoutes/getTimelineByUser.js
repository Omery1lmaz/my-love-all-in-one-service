"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimelineByUserRouter = void 0;
const express_1 = __importDefault(require("express"));
const getTimelineByUser_1 = __importDefault(require("../timelineControllers/getTimelineByUser"));
const router = express_1.default.Router();
exports.getTimelineByUserRouter = router;
router.get("/timeline", getTimelineByUser_1.default);
