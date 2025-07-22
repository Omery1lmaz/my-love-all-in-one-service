import express from "express";
import upload from "../utils/multer-s3/upload";
import uploadMultiPhotoTimelineController from "../photoControllers/uploadMultiPhotoTimeline";

const router = express.Router();

router.post(
  "/upload-multi-timeline",
  upload.array("photo", 10),
  uploadMultiPhotoTimelineController
);

export { router as uploadMultiPhotoTimeLineRouter };