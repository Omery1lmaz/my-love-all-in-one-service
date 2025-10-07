import { Router } from "express";
import { getUserLevelController } from "../levelControllers/getUserLevel";

const router = Router();

router.get("/user", getUserLevelController);

export { router as getUserLevelRouter };
