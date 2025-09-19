import express from "express";
import { sendTestNotificationController } from "../controllers/sendTestNotification";
import { requireAuth } from "@heaven-nsoft/my-love-common";

const router = express.Router();

router.post(
  "/test-notification",
  sendTestNotificationController
);

export { router as sendTestNotificationRouter };
