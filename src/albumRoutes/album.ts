import express from "express";
import { createAlbum } from "../albumsControllers/album";

const router = express.Router();

// Create album with optional cover photo
router.post("/albums", createAlbum);

export { router as albumRouter };
