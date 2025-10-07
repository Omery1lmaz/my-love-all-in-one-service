"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodRouter = void 0;
const express_1 = __importDefault(require("express"));
const mood_1 = require("../controllers/mood");
const router = express_1.default.Router();
exports.moodRouter = router;
router.post("/add-mood-entry", mood_1.addMoodEntry);
