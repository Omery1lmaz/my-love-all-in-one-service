import express from "express";
import { createHobbyController } from "../controllers/createHobby";
import { createBookController } from "../controllers/createBook";

const router = express.Router();

router.post("/books", createBookController);

export { router as createBookRouter };
