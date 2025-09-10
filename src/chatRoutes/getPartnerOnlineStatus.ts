import express from "express";
import { getPartnerOnlineStatus } from "../chatControllers/getPartnerOnlineStatus";
import { requireAuth } from "@heaven-nsoft/common";

const router = express.Router();

router.get(
  "/partner-online-status",
  requireAuth,
  getPartnerOnlineStatus
);

export { router as getPartnerOnlineStatusRouter }; 