"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordVerifyOTPRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const resetPasswordVerifyOTP_1 = __importDefault(require("../expressValidators/resetPasswordVerifyOTP"));
const resetPasswordVerifyOTP_2 = __importDefault(require("../controllers/resetPasswordVerifyOTP"));
const router = express_1.default.Router();
exports.resetPasswordVerifyOTPRouter = router;
router.post("/reset-password-verify-otp/:otp/:token/:email", resetPasswordVerifyOTP_1.default, common_1.validateRequest, resetPasswordVerifyOTP_2.default);
