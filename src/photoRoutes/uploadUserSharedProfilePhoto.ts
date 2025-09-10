import express from "express";
import upload from "../utils/upload";
import uploadUserSharedProfilePhotoController from "../photoControllers/uploadUserSharedProfilePhoto";

const router = express.Router();

router.post("/upload/user/shared/profile", upload.single("photo"), uploadUserSharedProfilePhotoController);

export { router as uploadUserSharedProfilePhotoRouter };
