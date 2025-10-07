import express from "express";
import deleteSpotifyConnectionController from "../controllers/deleteSpotifyConnection";

const router = express.Router();

router.delete(
  "/spotify-connection",
  deleteSpotifyConnectionController
);

export { router as deleteSpotifyConnectionRouter };
