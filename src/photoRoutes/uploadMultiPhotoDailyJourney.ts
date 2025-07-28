import express from "express";
import upload from "../utils/upload";
import uploadMultiPhotoDailyJourneyController from "../photoControllers/uploadMultiPhotoDailyJourney";

const router = express.Router();

router.post(
  "/upload-multi-daily-journey",
  upload.array("photo", 10),
  uploadMultiPhotoDailyJourneyController
);

export { router as uploadMultiPhotoDailyJourneyRouter };