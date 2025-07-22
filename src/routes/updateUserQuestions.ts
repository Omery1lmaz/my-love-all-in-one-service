import express from "express";
import updateUserQuestionsController from "../controllers/updateUserQuestions";
import updateUserQuestionsExpressValidator from "../expressValidators/updateUserQuestions";
import { validateRequest } from "@heaven-nsoft/my-love-common";

const router = express.Router();

router.post(
  "/update-user-questions",
  updateUserQuestionsExpressValidator,
  validateRequest,
  updateUserQuestionsController
);

export { router as updateUserQuestionsRouter };
