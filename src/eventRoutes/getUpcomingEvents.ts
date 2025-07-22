import express from "express";
import getUpcomingEventsController from "../eventControllers/getUpcomingEvents";

const router = express.Router();

router.get("/upcoming", getUpcomingEventsController);

export { router as getUpcomingEventsRouter }; 