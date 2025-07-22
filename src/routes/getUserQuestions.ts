import express from "express";
import updateUserQuestionsController from "../controllers/updateUserQuestions";
import getUserQuestionsController from "../controllers/getUserQuestions";

const router = express.Router();

router.get(
  "/user-questions",
  getUserQuestionsController
);

export { router as getUserQuestionsRouter };
