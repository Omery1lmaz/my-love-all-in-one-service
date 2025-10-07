"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetPasswordResendOTPRouter = void 0;
const express_1 = __importDefault(require("express"));
const forgetPasswordResendOTP_1 = __importDefault(require("../controllers/forgetPasswordResendOTP"));
const router = express_1.default.Router();
exports.forgetPasswordResendOTPRouter = router;
router.get("/forget-password-resend-otp", 
// forgetPasswordResendOTPExpressValidator,
// validateRequest,
forgetPasswordResendOTP_1.default);
