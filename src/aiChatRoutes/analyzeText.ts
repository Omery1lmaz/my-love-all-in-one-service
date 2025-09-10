import { Router } from "express";
import { analyzeText } from "../aiChatControllers/analyzeText";
import { analyzeTextValidator } from "../aiChatExpressValidators/analyzeText";
import { validateRequest } from "@heaven-nsoft/common";

const router = Router();

router.post("/text", analyzeTextValidator, validateRequest, analyzeText);

export { router as analyzeTextRouter };
