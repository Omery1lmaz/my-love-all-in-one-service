import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import signinController from "../controllers/signin";
import signinExpressValidator from "../expressValidators/signin";

const router = express.Router();

router.post(
  "/signin",
  signinExpressValidator,
  validateRequest,
  signinController
);

export { router as signinRouter };
