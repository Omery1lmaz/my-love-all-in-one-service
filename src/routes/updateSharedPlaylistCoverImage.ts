import express from "express";
import refreshPartnerSpotifyTokenController from "../controllers/refreshPartnerSpotifyToken";
import updateSharedPlaylistCoverImageController from "../controllers/updateSharedPlaylistCoverImage";

const router = express.Router();

router.put(
  "/update/sharedAlbum/image/:id",
  updateSharedPlaylistCoverImageController
);

export { router as updateSharedPlaylistCoverImageRouter };
