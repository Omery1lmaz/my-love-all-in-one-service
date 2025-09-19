import express from "express";
import { updateExpoPushTokenController } from "../controllers/updateExpoPushToken";
import { updateExpoPushTokenValidator } from "../expressValidators/updateExpoPushToken";
import { requireAuth } from "@heaven-nsoft/my-love-common";

const router = express.Router();

router.put(
  "/expo-push-token",
  updateExpoPushTokenValidator,
  updateExpoPushTokenController
);

export { router as updateExpoPushTokenRouter };
