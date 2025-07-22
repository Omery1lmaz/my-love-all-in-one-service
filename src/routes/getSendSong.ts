import express from "express";
import { sendSongController } from "../controllers/sendSong";
import { getSendSongController } from "../controllers/getSendSong";

const router = express.Router();

router.get("/spotify/song", getSendSongController);

export { router as getSendSongRouter };
