"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordRouter = void 0;
const express_1 = __importDefault(require("express"));
const resetPassword_1 = __importDefault(require("../controllers/resetPassword"));
const router = express_1.default.Router();
exports.resetPasswordRouter = router;
router.post("/reset-password-verify/:otp/:token/:email/:password", 
// googleSigninExpressValidator,
// validateRequest,
resetPassword_1.default);
