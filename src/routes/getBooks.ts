import express from "express";
import { getBooksController } from "../controllers/getBooks";

const router = express.Router();

router.get("/books", getBooksController);

export { router as getBooksRouter };
