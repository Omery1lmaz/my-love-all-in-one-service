"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerPartnerQuestionRouter = void 0;
const express_1 = __importDefault(require("express"));
const answerPartnerQuestion_1 = __importDefault(require("../controllers/answerPartnerQuestion"));
const router = express_1.default.Router();
exports.answerPartnerQuestionRouter = router;
router.post("/question/answer/:id", answerPartnerQuestion_1.default);
