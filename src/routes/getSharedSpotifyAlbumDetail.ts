import express from "express";
import getSharedSpotifyAlbumDetailController from "../controllers/getSharedSpotifyAlbumDetail";

const router = express.Router();

router.get("/spotify/album/detail/:id", getSharedSpotifyAlbumDetailController);

export { router as getSharedSpotifyAlbumDetailRouter };
