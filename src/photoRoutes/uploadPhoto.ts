import express from "express";
import upload from "../utils/upload";
import uploadPhotoController from "../photoControllers/uploadPhoto";

const router = express.Router();

router.post("/upload", upload.single("photo"), uploadPhotoController);

export { router as uploadPhotoRouter };
