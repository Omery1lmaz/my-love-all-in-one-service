import { Router } from "express";
import { requireAuth } from "@heaven-nsoft/common";
import { getSubscriptionHistory } from "../subscriptionControllers/getSubscriptionHistory";

const router = Router();

router.get("/", requireAuth, getSubscriptionHistory);

export { router as getSubscriptionHistoryRouter };
