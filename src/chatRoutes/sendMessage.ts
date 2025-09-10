import express from "express";
import { body } from "express-validator";
import { sendMessage } from "../chatControllers/sendMessage";
import { validateRequest } from "@heaven-nsoft/common";
import { requireAuth } from "@heaven-nsoft/common";

const router = express.Router();

router.post(
  "/send-message",
  [
    body("receiverId")
      .isMongoId()
      .withMessage("Receiver ID must be a valid MongoDB ID"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Message content is required")
      .isLength({ max: 1000 })
      .withMessage("Message content must be less than 1000 characters"),
    body("messageType")
      .optional()
      .isIn(["text", "image", "audio", "video", "file"])
      .withMessage("Invalid message type"),
    body("mediaUrl")
      .optional()
      .isURL()
      .withMessage("Media URL must be a valid URL")
  ],
  validateRequest,
  sendMessage
);

export { router as sendMessageRouter }; 