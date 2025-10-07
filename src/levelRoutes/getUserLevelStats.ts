import { Router } from "express";
import { getUserLevelStatsController } from "../levelControllers/getUserLevelStats";

const router = Router();

router.get("/user/stats", getUserLevelStatsController);

export { router as getUserLevelStatsRouter };
