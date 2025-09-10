import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import getEventByIdExpressValidator from "../eventexpressValidators/getUserEventsById";
import getUserEventsByIdController from "../eventControllers/getUserEventsById";
import { Request, Response } from "express";
import { Event } from "../Models/event";

const router = express.Router();

router.delete(
    "/remove-all-events",
    async (req: Request, res: Response) => {
        try {
            await Event.deleteMany({});
            console.log("remove-all-events");
            res.status(200).json({ message: "Events removed successfully" });
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ message: "Events not removed" });
        }
    }

);

export { router as removeAllEventsRouter };
