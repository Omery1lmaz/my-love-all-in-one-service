import express from "express";
import upload from "../utils/multer-s3/upload";
import uploadMultiPhotoController from "../photoControllers/uploadMultiPhoto";

const router = express.Router();

router.post(
  "/upload-multi",
  upload.array("photo", 10),
  uploadMultiPhotoController
);

export { router as uploadMultiPhotoRouter };
