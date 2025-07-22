import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import profileExpressValidator from "../expressValidators/profile";
import profileController from "../controllers/profile";

const router = express.Router();

router.post(
  "/profile",
  profileExpressValidator,
  validateRequest,
  profileController
);

export { router as profileRouter };
