import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import createJournalExpressValidator from "../dailyJourneyExpressValidators/createJournal";
import createJournalController from "../dailyJourneyControllers/createJournal";

const router = express.Router();

router.post(
  "/create-journal",
  createJournalExpressValidator,
  validateRequest,
  createJournalController
);

export { router as createJournalRouter };
