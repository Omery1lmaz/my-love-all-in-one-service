import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import checkRegisterEmailExpressValidator from "../expressValidators/checkRegisterEmail";
import checkRegisterEmailController from "../controllers/checkRegisterEmail";

const router = express.Router();

router.post(
  "/check-register-email",
  checkRegisterEmailExpressValidator,
  validateRequest,
  checkRegisterEmailController
);

export { router as checkRegisterEmailRouter };
