import express from "express";
import upload from "../utils/multer-s3/upload";
import { requireAuth } from "@heaven-nsoft/my-love-common";
import { userAlbums } from "../albumsControllers/userAlbums";

const router = express.Router();

router.get("/user-albums", userAlbums);

export { router as userAlbumRouter };
