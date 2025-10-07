import { Router } from "express";
import { getUserSubscription } from "../subscriptionControllers/getUserSubscription";

const router = Router();

router.get("/", getUserSubscription);

export { router as getUserSubscriptionRouter };
