import express from "express";
import getUserHobbiesController from "../controllers/getUserHobbies";
import { validateRequest } from "@heaven-nsoft/my-love-common";

const router = express.Router();

router.get("/hobbies", getUserHobbiesController);
export { router as getUserHobbiesRouter };
