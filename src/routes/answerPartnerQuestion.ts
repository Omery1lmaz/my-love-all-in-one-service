import express from "express";
import answerPartnerQuestionController from "../controllers/answerPartnerQuestion";

const router = express.Router();

router.post(
  "/question/answer/:id",
  answerPartnerQuestionController
);

export { router as answerPartnerQuestionRouter };
