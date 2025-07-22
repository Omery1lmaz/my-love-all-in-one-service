import express from "express";
import updateUserQuestionsController from "../controllers/updateUserQuestions";
import getUserQuestionsController from "../controllers/getUserQuestions";
import getPartnerQuestionsController from "../controllers/getPartnerQuestions";

const router = express.Router();

router.get(
  "/partner-questions",
  getPartnerQuestionsController
);

export { router as getPartnerQuestionsRouter };
