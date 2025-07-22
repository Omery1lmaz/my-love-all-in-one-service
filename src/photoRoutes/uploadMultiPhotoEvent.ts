import express from "express";
import upload from "../utils/multer-s3/upload";
import uploadMultiPhotoEventController from "../photoControllers/uploadMultiPhotoEvent";

const router = express.Router();

router.post(
  "/upload-multi-event",
  upload.array("photo", 10),
  uploadMultiPhotoEventController
);

export { router as uploadMultiPhotoEventRouter };
