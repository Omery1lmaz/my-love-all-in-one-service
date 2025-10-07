import { Router } from "express";
import { getAvailablePlans } from "../subscriptionControllers/getAvailablePlans";

const router = Router();

router.get("/", getAvailablePlans);

export { router as getAvailablePlansRouter };
