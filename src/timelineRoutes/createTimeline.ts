import express from "express";
import { requireAuth } from "@heaven-nsoft/common";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import createTimelineExpressValidator from "../timelineExpressValidators/createTimeline";
import createTimelineController from "../timelineControllers/createTimeline";
import upload from "../utils/upload";

const router = express.Router();

router.post(
  "/timeline",
  upload.array("photo", 10),
  createTimelineExpressValidator,
  validateRequest,
  createTimelineController
);

export { router as createTimelineRouter };
