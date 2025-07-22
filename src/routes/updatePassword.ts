import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import signinController from "../controllers/signin";
import googleSigninExpressValidator from "../expressValidators/googleSignin";
import googleSigninController from "../controllers/googleSignin";
import resetPasswordController from "../controllers/resetPassword";
import updatePasswordController from "../controllers/updatePassword";
import updatePasswordExpressValidator from "../expressValidators/updatePassword";

const router = express.Router();

router.post(
  "/reset-password-verify/:otp/:token/:email/:password",
  updatePasswordExpressValidator,
  validateRequest,
  updatePasswordController
);

export { router as updatePasswordRouter };
