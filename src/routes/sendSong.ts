import express from "express";
import { sendSongController } from "../controllers/sendSong";

const router = express.Router();

router.post("/spotify/song", sendSongController);

export { router as sendSongRouter };
