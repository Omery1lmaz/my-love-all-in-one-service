import express from "express";
import getNotScoredQuestionsController from "../controllers/getNotScoredQuestions";
import updateQuestionScoreController from "../controllers/updateQuestionScore";

const router = express.Router();

router.post(
  "/update-question-score/:id",
  updateQuestionScoreController
);

export { router as UpdateQuestionScoreRouter };
