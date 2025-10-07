"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordLastModifiedRouter = void 0;
const express_1 = __importDefault(require("express"));
const resetPasswordLastVersion_1 = __importDefault(require("../controllers/resetPasswordLastVersion"));
const router = express_1.default.Router();
exports.resetPasswordLastModifiedRouter = router;
router.post("/user-reset-password", resetPasswordLastVersion_1.default);
