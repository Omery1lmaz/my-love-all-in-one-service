import express from "express";
import { deleteBookController } from "../controllers/deleteBook";

const router = express.Router();

router.delete("/books/:id", deleteBookController);

export { router as deleteBookRouter };
