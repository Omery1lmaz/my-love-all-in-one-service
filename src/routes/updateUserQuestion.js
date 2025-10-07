"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserQuestionRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateUserQuestion_1 = __importDefault(require("../controllers/updateUserQuestion"));
const router = express_1.default.Router();
exports.updateUserQuestionRouter = router;
router.put("/update-user-question/:id", updateUserQuestion_1.default);
