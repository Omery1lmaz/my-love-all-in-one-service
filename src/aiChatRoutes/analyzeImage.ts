import { Router } from "express";
import { analyzeImage } from "../aiChatControllers/analyzeImage";
import { analyzeImageValidator } from "../aiChatExpressValidators/analyzeImage";
import { validateRequest } from "@heaven-nsoft/common";

const router = Router();

router.post("/image", analyzeImageValidator, validateRequest, analyzeImage);

export { router as analyzeImageRouter };
