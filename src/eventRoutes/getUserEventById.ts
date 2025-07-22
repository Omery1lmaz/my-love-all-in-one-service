import express from "express";
import getUserEventsByIdController from "../eventControllers/getUserEventsById";

const router = express.Router();

router.get(
  "/event/:id",
  // upload.array("photo", 10),
  // createEventExpressValidator,
  // validateRequest,
  getUserEventsByIdController
);

export { router as getUserEventByIdRouter };
