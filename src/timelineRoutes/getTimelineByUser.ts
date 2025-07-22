import express from "express";
import getTimeLineByUser from "../timelineControllers/getTimelineByUser";
const router = express.Router();

router.get("/timeline", getTimeLineByUser);

export { router as getTimelineByUserRouter };
