"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuestionScoreRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateQuestionScore_1 = __importDefault(require("../controllers/updateQuestionScore"));
const router = express_1.default.Router();
exports.UpdateQuestionScoreRouter = router;
router.post("/update-question-score/:id", updateQuestionScore_1.default);
