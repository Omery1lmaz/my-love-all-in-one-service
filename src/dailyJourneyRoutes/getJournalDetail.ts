import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import getJournalDetailController from "../dailyJourneyControllers/getJournalDetail";

const router = express.Router();

router.get("/journal/:id", validateRequest, getJournalDetailController);

export { router as getJournalDetailRouter };
