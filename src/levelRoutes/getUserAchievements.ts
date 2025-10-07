import { Router } from "express";
import { getUserAchievementsController } from "../levelControllers/getUserAchievements";

const router = Router();

router.get("/achievements/user", getUserAchievementsController);

export { router as getUserAchievementsRouter };
