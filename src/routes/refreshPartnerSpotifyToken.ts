import express from "express";
import refreshPartnerSpotifyTokenController from "../controllers/refreshPartnerSpotifyToken";

const router = express.Router();

router.get(
  "/refresh/partner/spotify-token",
  refreshPartnerSpotifyTokenController
);

export { router as refreshPartnerSpotifyTokenRouter };
