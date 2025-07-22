import express from "express";
import { addMoodEntry } from "../controllers/mood";

const router = express.Router();

router.post("/add-mood-entry", addMoodEntry);

export { router as moodRouter };
