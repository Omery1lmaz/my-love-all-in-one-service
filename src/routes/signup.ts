import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import signinExpressValidator from "../expressValidators/signin";
import signupController from "../controllers/signup";

const router = express.Router();

router.post(
  "/signup",
  signinExpressValidator,
  validateRequest,
  signupController
);

export { router as signupRouter };
