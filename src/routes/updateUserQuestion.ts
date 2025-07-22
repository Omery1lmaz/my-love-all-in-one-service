import express from "express";
import updateSharedSpotifyAlbumController from "../controllers/updateSharedSpotifyAlbum";
import updateUserQuestionController from "../controllers/updateUserQuestion";

const router = express.Router();

router.put("/update-user-question/:id", updateUserQuestionController);

export { router as updateUserQuestionRouter };
