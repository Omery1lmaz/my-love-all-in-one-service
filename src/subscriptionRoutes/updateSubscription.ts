import { Router } from "express";
import { requireAuth, validateRequest } from "@heaven-nsoft/common";
import { updateSubscription } from "../subscriptionControllers/updateSubscription";
import { updateSubscriptionValidator } from "../subscriptionExpressValidators/updateSubscription";

const router = Router();

router.put("/", requireAuth, updateSubscriptionValidator, validateRequest, updateSubscription);

export { router as updateSubscriptionRouter };
