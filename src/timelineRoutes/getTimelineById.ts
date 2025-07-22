import express from "express";
import getTimeLineById from "../timelineControllers/getTimelineById";

const router = express.Router();

router.get("/timeline/:id", getTimeLineById);

export { router as getTimelineByIdRouter };
