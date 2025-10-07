"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserQuestionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateUserQuestions_1 = __importDefault(require("../controllers/updateUserQuestions"));
const updateUserQuestions_2 = __importDefault(require("../expressValidators/updateUserQuestions"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const router = express_1.default.Router();
exports.updateUserQuestionsRouter = router;
router.post("/update-user-questions", updateUserQuestions_2.default, my_love_common_1.validateRequest, updateUserQuestions_1.default);
