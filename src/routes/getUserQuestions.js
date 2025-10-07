"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserQuestionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const getUserQuestions_1 = __importDefault(require("../controllers/getUserQuestions"));
const router = express_1.default.Router();
exports.getUserQuestionsRouter = router;
router.get("/user-questions", getUserQuestions_1.default);
