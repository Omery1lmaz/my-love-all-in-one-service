import express from "express";
import { createTodaySongController } from "../controllers/createTodaySong";

const router = express.Router();

router.post("/spotify/taday/song", createTodaySongController);

export { router as createTodaySongRouter };
