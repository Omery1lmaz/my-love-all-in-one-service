import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import updateSpotifyTokensController from "../controllers/updateSpotifyTokens";
import updateSpotifyTokensExpressValidator from "../expressValidators/updateSpotifyTokens";

const router = express.Router();

router.post(
  "/update-spotify-tokens",
  updateSpotifyTokensExpressValidator,
  validateRequest,
  updateSpotifyTokensController
);

export { router as updateSpotifyTokensRouter };
