import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import getSharedUserMovieController from "../controllers/getUserSharedMovie";

const router = express.Router();

router.get(
  "/get-user-shared-movie",
  validateRequest,
  getSharedUserMovieController
);

export { router as getUserSharedMovieRouter };
