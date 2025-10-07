"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotScoredQuestionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const getNotScoredQuestions_1 = __importDefault(require("../controllers/getNotScoredQuestions"));
const router = express_1.default.Router();
exports.getNotScoredQuestionsRouter = router;
router.get("/questions-not-scored", getNotScoredQuestions_1.default);
