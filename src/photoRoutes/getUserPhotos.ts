import express from "express";
import { requireAuth } from "@heaven-nsoft/common";
import getUserPhotosController from "../photoControllers/getUserPhotos";

const router = express.Router();

router.get("/photos/user", getUserPhotosController);

export { router as getUserPhotosRouter };
