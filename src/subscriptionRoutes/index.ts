import { Router } from "express";
import { getUserSubscriptionRouter } from "./getUserSubscription";
import { updateSubscriptionRouter } from "./updateSubscription";
import { getAvailablePlansRouter } from "./getAvailablePlans";
import { cancelSubscriptionRouter } from "./cancelSubscription";
import { getSubscriptionHistoryRouter } from "./getSubscriptionHistory";

const router = Router();

// Subscription management routes
router.use("/", getUserSubscriptionRouter);           // GET /subscription
router.use("/", updateSubscriptionRouter);            // PUT /subscription
router.use("/", cancelSubscriptionRouter);            // DELETE /subscription
router.use("/history", getSubscriptionHistoryRouter); // GET /subscription/history
router.use("/plans", getAvailablePlansRouter);        // GET /subscription/plans

export { router as subscriptionRouter };
