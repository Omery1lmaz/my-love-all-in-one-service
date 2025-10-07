import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import signinController from "../controllers/signin";
import googleSigninExpressValidator from "../expressValidators/googleSignin";
import googleSigninController from "../controllers/googleSignin";
import applyResetPasswordController from "../controllers/applyResetPassword";

const router = express.Router();

router.post("/apply-reset-password", applyResetPasswordController);

export { router as applyResetPasswordRouter };
