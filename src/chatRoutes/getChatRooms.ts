import express from "express";
import { getChatRooms } from "../chatControllers/getChatRooms";
import { requireAuth } from "@heaven-nsoft/common";

const router = express.Router();

router.get(
  "/chat-rooms",
  requireAuth,
  getChatRooms
);

export { router as getChatRoomsRouter }; 