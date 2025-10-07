import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import resetPasswordLastModifiedController from "../controllers/resetPasswordLastVersion";

const router = express.Router();

router.post(
  "/user-reset-password",
  resetPasswordLastModifiedController
);

export { router as resetPasswordLastModifiedRouter };
