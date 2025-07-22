import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import getSharedUserMovieController from "../controllers/getUserSharedMovie";
import getSharedUserMovieDetailController from "../controllers/getUserSharedMovieDetail";

const router = express.Router();

router.get(
  "/get-user-shared-movie/detail/:id",
  validateRequest,
  getSharedUserMovieDetailController
);

export { router as getUserSharedMovieDetailRouter };
