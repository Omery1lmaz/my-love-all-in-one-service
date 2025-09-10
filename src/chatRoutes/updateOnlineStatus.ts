import express from "express";
import { body } from "express-validator";
import { updateOnlineStatus } from "../chatControllers/updateOnlineStatus";
import { validateRequest } from "@heaven-nsoft/common";
import { requireAuth } from "@heaven-nsoft/common";

const router = express.Router();

router.put(
  "/online-status",
  requireAuth,
  [
    body("isOnline")
      .isBoolean()
      .withMessage("isOnline must be a boolean"),
    body("socketId")
      .optional()
      .isString()
      .withMessage("Socket ID must be a string")
  ],
  validateRequest,
  updateOnlineStatus
);

export { router as updateOnlineStatusRouter }; 