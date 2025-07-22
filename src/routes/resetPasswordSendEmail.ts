import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import resetPasswordSendEmailController from "../controllers/resetPasswordSendEmail";
import resetPasswordSendEmailExpressValidator from "../expressValidators/resetPasswordSendEmail";

const router = express.Router();

router.post(
  "/reset-password-send-email",
  resetPasswordSendEmailExpressValidator,
  validateRequest,
  resetPasswordSendEmailController
);

export { router as resetPasswordSendEmailRouter };
