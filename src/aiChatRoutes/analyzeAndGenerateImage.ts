import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import { analyzeAndGenerateImageValidator } from "../aiChatExpressValidators/analyzeAndGenerateImage";
import {
  analyzeAndGenerateImageController,
  uploadMiddleware,
} from "../aiChatControllers/analyzeAndGenerateImage";

const router = express.Router();

router.post(
  "/analyze-and-generate-image",
  uploadMiddleware,
  analyzeAndGenerateImageValidator,
  validateRequest,
  analyzeAndGenerateImageController
);

export { router as analyzeAndGenerateImageRouter };
