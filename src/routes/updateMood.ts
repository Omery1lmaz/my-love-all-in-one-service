import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import updateMoodController from "../controllers/updateMood";
import updateMoodExpressValidator from "../expressValidators/updateMood";

const router = express.Router();

router.post(
  "/update-user-mood",
  updateMoodExpressValidator,
  validateRequest,
  updateMoodController
);

export { router as updateMoodRouter };
