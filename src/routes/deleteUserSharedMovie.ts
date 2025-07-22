import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import deleteSharedUserMovieController from "../controllers/deleteUserSharedMovie";

const router = express.Router();

router.delete(
  "/delete-user-shared-movie/:id",
  validateRequest,
  deleteSharedUserMovieController
);

export { router as deleteUserSharedMovieRouter };
