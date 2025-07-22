import express from "express";
import { deleteHobbyController } from "../controllers/deleteHobby";

const router = express.Router();

router.delete("/hobbies/:id", deleteHobbyController);

export { router as deleteHobbyRouter };
