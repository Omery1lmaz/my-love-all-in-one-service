import express from "express";
import signupController from "../controllers/signup";

const router = express.Router();

router.post(
  "/signup",
  signupController
);

export { router as signupRouter };
