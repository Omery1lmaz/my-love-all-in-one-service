"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerQuestionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const getPartnerQuestions_1 = __importDefault(require("../controllers/getPartnerQuestions"));
const router = express_1.default.Router();
exports.getPartnerQuestionsRouter = router;
router.get("/partner-questions", getPartnerQuestions_1.default);
