import express from "express";
import { addQuizResult } from "../controllers/quiz";

const router = express.Router();

router.post("/add-quiz-result", addQuizResult);

export { router as quizRouter };
