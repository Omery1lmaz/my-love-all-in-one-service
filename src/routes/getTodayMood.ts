import express from "express";
import getTodayMoodController from "../controllers/getTodayMood";

const router = express.Router();

router.get("/today-mood", getTodayMoodController);

export { router as getTodayMoodRouter };
