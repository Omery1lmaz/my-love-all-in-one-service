import express from "express";
import upload from "../utils/multer-s3/upload";
import uploadUserPhotoController from "../photoControllers/uploadUserPhoto";

const router = express.Router();

router.post("/upload/user/profile", upload.single("photo"), uploadUserPhotoController);

export { router as uploadUserProfilePhotoRouter };
