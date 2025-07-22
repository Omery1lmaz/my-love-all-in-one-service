import express from "express";
import updateSharedSpotifyAlbumController from "../controllers/updateSharedSpotifyAlbum";

const router = express.Router();

router.post("/spotify/album", updateSharedSpotifyAlbumController);

export { router as updateSharedSpotifyAlbumRouter };
