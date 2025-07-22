import express from "express";
import { createHobbyController } from "../controllers/createHobby";

const router = express.Router();

router.post("/hobbies", createHobbyController);

export { router as createHobbyRouter };
