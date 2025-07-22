import express from "express";
import updateUserPhotoMoment from "../photoControllers/updateUserPhotoMoment";

const router = express.Router();

router.put("/photos/moment/:photoId", updateUserPhotoMoment);

export { router as updateUserPhotoMomentRouter };
