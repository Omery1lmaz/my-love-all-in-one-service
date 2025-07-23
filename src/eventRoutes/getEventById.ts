import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import getEventByIdExpressValidator from "../eventexpressValidators/getUserEventsById";
import getUserEventsByIdController from "../eventControllers/getUserEventsById";

const router = express.Router();

router.get(
  "/event/:id",
  // getEventByIdExpressValidator,
  // validateRequest,
  getUserEventsByIdController
);

export { router as getUserEventByIdRouter };
