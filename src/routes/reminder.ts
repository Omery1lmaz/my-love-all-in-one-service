import express from "express";
import { addReminder } from "../controllers/reminder";

const router = express.Router();

router.post("/add-reminder", addReminder);

export { router as reminderRouter };
