import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import signupController from "../controllers/signup";
import verifyRegisterExpressValidator from "../expressValidators/verifyRegister";
import verifyRegisterController from "../controllers/verifyRegister";

const router = express.Router();

router.post(
  "/verify-register/:token/:otp",
  verifyRegisterExpressValidator,
  validateRequest,
  verifyRegisterController
);

export { router as verifyRegisterRouter };
