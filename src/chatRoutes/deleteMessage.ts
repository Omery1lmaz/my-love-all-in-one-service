import express from "express";
import { deleteMessage } from "../chatControllers/deleteMessage";
import { requireAuth } from "@heaven-nsoft/common";

const router = express.Router();

router.delete(
  "/message/:messageId",
  requireAuth,
  deleteMessage
);

export { router as deleteMessageRouter }; 