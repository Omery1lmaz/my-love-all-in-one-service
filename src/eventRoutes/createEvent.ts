import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import upload from "../utils/multer-s3/upload";
import createEventController from "../eventControllers/createEvent";

const router = express.Router();

router.post(
  "/create-event",
  // upload.array("photo", 10),
  // createEventExpressValidator,
  // validateRequest,
  createEventController
);

export { router as createEventRouter };
