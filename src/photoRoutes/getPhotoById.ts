import express from "express";
import getPhotoByIdController from "../photoControllers/getPhotoById";

const router = express.Router();

router.get("/photos/:photoId", getPhotoByIdController);

export { router as getPhotoByIdRouter };
