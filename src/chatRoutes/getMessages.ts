import express from "express";
import { getMessages } from "../chatControllers/getMessages";
import { requireAuth } from "@heaven-nsoft/common";

const router = express.Router();

router.get(
  "/messages/:partnerId",
  requireAuth,
  getMessages
);

export { router as getMessagesRouter }; 