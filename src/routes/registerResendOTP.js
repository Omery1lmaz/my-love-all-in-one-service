"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerResendOTPRouter = void 0;
const express_1 = __importDefault(require("express"));
const registerResendOTP_1 = __importDefault(require("../controllers/registerResendOTP"));
const router = express_1.default.Router();
exports.registerResendOTPRouter = router;
router.post("/resend-otp", 
// registerResendExpressValidator,
// validateRequest,
registerResendOTP_1.default);
