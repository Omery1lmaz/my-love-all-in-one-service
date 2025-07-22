import express from "express";
import updateUserFavoriteMovieController from "../controllers/updateUserFavoriteMovie";
import updateUserFavoriteMovieExpressValidator from "../expressValidators/updateUserFavoriteMovie";
import { validateRequest } from "@heaven-nsoft/my-love-common";

const router = express.Router();

router.post(
  "/update-user-favorite-movie",
  updateUserFavoriteMovieExpressValidator,
  validateRequest,
  updateUserFavoriteMovieController
);

export { router as updateUserFavoriteMovieRouter };
