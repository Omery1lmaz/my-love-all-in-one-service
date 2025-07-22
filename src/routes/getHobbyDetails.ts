import express from "express";
import { getHobbiesController } from "../controllers/getHobbies";
import { getHobbyDetailsController } from "../controllers/getHobbyDetails";

const router = express.Router();

router.get("/hobbies/:id", getHobbyDetailsController);

export { router as getHobbyDetailsRouter };
