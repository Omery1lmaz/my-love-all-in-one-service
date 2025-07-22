import express from "express";
import { createHobbyController } from "../controllers/createHobby";
import { updateHobbyController } from "../controllers/updateHoobby";

const router = express.Router();

router.put("/hobbies/:id", updateHobbyController);

export { router as updateHobbyRouter };
