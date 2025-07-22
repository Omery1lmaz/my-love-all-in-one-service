import express from "express";
import { validateRequest } from "@heaven-nsoft/common";
import updateUserNameExpressValidator from "../expressValidators/profile";
import updateUserNameController from "../controllers/updateUserName";

const router = express.Router();

router.post(
  "/update-userName",
  updateUserNameExpressValidator,
  validateRequest,
  updateUserNameController
);

export { router as updateUserNameRouter };
