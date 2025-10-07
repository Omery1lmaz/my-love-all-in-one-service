import express from "express";
import forgetPasswordResendEmailController from "../controllers/forgetPasswordResendEmail";

const router = express.Router();

router.get(
  "/forget-password-resend-email",
  // forgetPasswordResendOTPExpressValidator,
  // validateRequest,
  forgetPasswordResendEmailController
);

export { router as forgetPasswordResendEmailRouter };
