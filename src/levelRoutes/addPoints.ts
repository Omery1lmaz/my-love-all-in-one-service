import { Router } from "express";
import { addPointsController } from "../levelControllers/addPoints";
import { addPointsValidator } from "../levelExpressValidators/addPoints";
import { validateRequest } from "@heaven-nsoft/common";

const router = Router();

router.post("/add-points", addPointsValidator, validateRequest, addPointsController);

export { router as addPointsRouter };
