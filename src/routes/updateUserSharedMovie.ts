import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import updateSharedUserMovieController from "../controllers/updateUserSharedMovie";

const router = express.Router();

router.post(
  "/update-user-shared-movie",
  validateRequest,
  updateSharedUserMovieController
);

export { router as updateUserSharedMovieRouter };
