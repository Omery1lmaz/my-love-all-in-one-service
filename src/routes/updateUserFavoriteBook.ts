import express from "express";
import { validateRequest } from "@heaven-nsoft/my-love-common";
import updateUserFavoriteBookController from "../controllers/updateUserFavoriteBook";
import updateUserFavoriteBookExpressValidator from "../expressValidators/updateUserFavoriteBook";

const router = express.Router();

router.post(
  "/update-user-favorite-book",
  updateUserFavoriteBookExpressValidator,
  validateRequest,
  updateUserFavoriteBookController
);

export { router as updateUserFavoriteBookRouter };
