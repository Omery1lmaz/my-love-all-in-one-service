import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import forgetPasswordResendOTPController from "../controllers/forgetPasswordResendOTP";
import forgetPasswordResendOTPExpressValidator from "../expressValidators/forgetPasswordResendOTP";

const router = express.Router();

router.get(
  "/forget-password-resend-otp",
  forgetPasswordResendOTPExpressValidator,
  validateRequest,
  forgetPasswordResendOTPController
);

export { router as forgetPasswordResendOTPRouter };
