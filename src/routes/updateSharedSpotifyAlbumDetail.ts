import express from "express";
import updateSharedSpotifyAlbumDetailController from "../controllers/updateSharedSpotifyAlbumDetail";

const router = express.Router();

router.put("/spotify/album/detail/:id", updateSharedSpotifyAlbumDetailController);

export { router as updateSharedSpotifyAlbumDetailRouter };
