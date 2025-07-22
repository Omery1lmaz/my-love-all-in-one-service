import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import deleteProfileController from "../controllers/deleteProfile";

const router = express.Router();

router.delete("/profile", validateRequest, deleteProfileController);

export { router as deleteProfileRouter };
