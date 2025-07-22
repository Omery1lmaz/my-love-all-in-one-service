import express from "express";
import updateUserQuestionsController from "../controllers/updateUserQuestions";
import updateUserQuestionsExpressValidator from "../expressValidators/updateUserQuestions";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import updateUserHobbiesController from "../controllers/updateUserHobbies";
import updateUserHobbiesExpressValidator from "../expressValidators/updateUserHobbies";

const router = express.Router();

router.post(
  "/update-user-hobbies",
  updateUserHobbiesExpressValidator,
  validateRequest,
  updateUserHobbiesController
);

export { router as updateUserHobbiesRouter };
