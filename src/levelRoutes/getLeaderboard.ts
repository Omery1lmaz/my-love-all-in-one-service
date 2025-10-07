import { Router } from "express";
import { getLeaderboardController } from "../levelControllers/getLeaderboard";

const router = Router();

router.get("/leaderboard", getLeaderboardController);

export { router as getLeaderboardRouter };
