"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetPasswordResendEmailRouter = void 0;
const express_1 = __importDefault(require("express"));
const forgetPasswordResendEmail_1 = __importDefault(require("../controllers/forgetPasswordResendEmail"));
const router = express_1.default.Router();
exports.forgetPasswordResendEmailRouter = router;
router.get("/forget-password-resend-email", 
// forgetPasswordResendOTPExpressValidator,
// validateRequest,
forgetPasswordResendEmail_1.default);
