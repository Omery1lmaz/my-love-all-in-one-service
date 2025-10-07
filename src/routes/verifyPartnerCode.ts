import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import verifyRegisterExpressValidator from "../expressValidators/verifyRegister";
import verifyPartnerCodeController from "../controllers/verifyPartnerCode";
import verifyPartnerCodeExpressValidator from "../expressValidators/verifyPartnerCode";

const router = express.Router();

router.post(
  "/verify-partner-code/:otp",
  verifyPartnerCodeExpressValidator,
  validateRequest,
  verifyPartnerCodeController
);

export { router as verifyPartnerCodeRouter };
