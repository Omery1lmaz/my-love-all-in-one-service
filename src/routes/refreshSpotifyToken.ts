import express from "express";
import refreshSpotifyTokenController from "../controllers/refreshSpotifyToken";

const router = express.Router();

router.get("/refresh/spotify-token", refreshSpotifyTokenController);

export { router as refreshSpotifyTokenRouter };
