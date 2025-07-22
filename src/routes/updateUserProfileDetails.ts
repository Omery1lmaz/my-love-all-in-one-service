import express from "express";
import updateUserProfileDetailsController from "../controllers/updateUserProfileDetails";
import upload from "../utils/multer-s3/upload";

const router = express.Router();

router.post(
  "/update-user-profile-details",
  upload.single("profilePhoto"),
  updateUserProfileDetailsController
);

export { router as updateUserProfileDetailsRouter };
