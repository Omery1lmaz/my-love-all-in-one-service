"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingEventsRouter = void 0;
const express_1 = __importDefault(require("express"));
const getUpcomingEvents_1 = __importDefault(require("../eventControllers/getUpcomingEvents"));
const router = express_1.default.Router();
exports.getUpcomingEventsRouter = router;
router.get("/upcoming", getUpcomingEvents_1.default);
