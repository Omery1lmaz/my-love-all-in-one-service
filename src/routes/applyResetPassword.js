"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyResetPasswordRouter = void 0;
const express_1 = __importDefault(require("express"));
const applyResetPassword_1 = __importDefault(require("../controllers/applyResetPassword"));
const router = express_1.default.Router();
exports.applyResetPasswordRouter = router;
router.post("/apply-reset-password", applyResetPassword_1.default);
