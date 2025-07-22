import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import forgetPasswordResendOTPController from "../controllers/forgetPasswordResendOTP";
import resetPasswordVerifyOTPExpressValidator from "../expressValidators/resetPasswordVerifyOTP";
import resetPasswordVerifyOTPController from "../controllers/resetPasswordVerifyOTP";

const router = express.Router();

router.post(
  "/reset-password-verify-otp/:otp/:token/:email",
  resetPasswordVerifyOTPExpressValidator,
  validateRequest,
  resetPasswordVerifyOTPController
);

export { router as resetPasswordVerifyOTPRouter };
