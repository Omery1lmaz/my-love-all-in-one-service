import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import signinController from "../controllers/signin";
import signinExpressValidator from "../expressValidators/signin";
import registerResendExpressValidator from "../expressValidators/registerResendOTP";
import registerResendOTPController from "../controllers/registerResendOTP";

const router = express.Router();

router.post(
  "/resend-otp",
  registerResendExpressValidator,
  validateRequest,
  registerResendOTPController
);

export { router as registerResendOTPRouter };
