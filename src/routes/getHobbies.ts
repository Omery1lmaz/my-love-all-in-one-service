import express from "express";
import { getHobbiesController } from "../controllers/getHobbies";

const router = express.Router();

router.get("/hobbies", getHobbiesController);

export { router as getHobbiesRouter };
