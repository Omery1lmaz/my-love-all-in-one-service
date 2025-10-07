import { Router } from "express";
import { requireAuth } from "@heaven-nsoft/common";
import { cancelSubscription } from "../subscriptionControllers/cancelSubscription";

const router = Router();

router.delete("/", requireAuth, cancelSubscription);

export { router as cancelSubscriptionRouter };
