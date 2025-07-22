import express from "express";
import getEventsController from "../eventControllers/getEvents";

const router = express.Router();

router.get("/events", getEventsController);

export { router as getUserEventsRouter };
