import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import verifyRegisterExpressValidator from "../expressValidators/verifyRegister";
import verifyRegisterPartnerCodeController from "../controllers/verifyRegisterPartnerCode";

const router = express.Router();

router.post(
  "/verify-register-partner-code/:token/:otp",
  verifyRegisterExpressValidator,
  validateRequest,
  verifyRegisterPartnerCodeController
);

export { router as verifyRegisterPartnerCodeRouter };
