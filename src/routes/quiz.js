"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizRouter = void 0;
const express_1 = __importDefault(require("express"));
const quiz_1 = require("../controllers/quiz");
const router = express_1.default.Router();
exports.quizRouter = router;
router.post("/add-quiz-result", quiz_1.addQuizResult);
