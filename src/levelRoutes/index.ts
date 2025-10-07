import { Router } from "express";
import { getUserLevelRouter } from "./getUserLevel";
import { getUserAchievementsRouter } from "./getUserAchievements";
import { addPointsRouter } from "./addPoints";
import { getLeaderboardRouter } from "./getLeaderboard";
import { getUserLevelStatsRouter } from "./getUserLevelStats";

const router = Router();

// Level and Points Routes
router.use(getUserLevelRouter);
router.use(getUserAchievementsRouter);
router.use(addPointsRouter);
router.use(getLeaderboardRouter);
router.use(getUserLevelStatsRouter);

export { router as levelRoutes };
