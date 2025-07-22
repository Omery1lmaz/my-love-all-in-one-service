import express from "express";
import getNotScoredQuestionsController from "../controllers/getNotScoredQuestions";

const router = express.Router();

router.get(
  "/questions-not-scored",
  getNotScoredQuestionsController
);

export { router as getNotScoredQuestionsRouter };
