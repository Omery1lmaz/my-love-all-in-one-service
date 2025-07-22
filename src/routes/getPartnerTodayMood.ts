import express from "express";
import getTodayMoodController from "../controllers/getTodayMood";
import getPartnerTodayMoodController from "../controllers/getPartnerTodayMood";

const router = express.Router();

router.get("/partner/today-mood", getPartnerTodayMoodController);

export { router as getPartnerTodayMoodRouter };
