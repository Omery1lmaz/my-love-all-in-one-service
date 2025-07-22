import express from "express";
import updateUserRelationshipDateController from "../controllers/updateUserrelationshipDate";

const router = express.Router();

router.post(
  "/update-user-relationship-date",
  updateUserRelationshipDateController
);

export { router as updateUserRelationshipDateRouter };
