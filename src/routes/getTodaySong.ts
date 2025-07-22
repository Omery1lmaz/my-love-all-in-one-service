import express from "express";
import { getTodaySongController } from "../controllers/getTodaySong";

const router = express.Router();

router.get("/spotify/taday/song", getTodaySongController);

export { router as getTodaySongRouter };
