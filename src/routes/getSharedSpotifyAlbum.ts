import express from "express";
import getSharedSpotifyAlbumController from "../controllers/getSharedSpotifyAlbum";

const router = express.Router();

router.get("/spotify/album", getSharedSpotifyAlbumController);

export { router as getSharedSpotifyAlbumRouter };
