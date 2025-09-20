import express from "express";
import googleSigninController from "../controllers/googleSignin";

const router = express.Router();

router.post(
  "/google-signin",
  // googleSigninExpressValidator,
  // validateRequest,
  googleSigninController
);

export { router as googleSigninRouter };
