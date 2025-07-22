import express from "express";
import getUserRelationshipDateController from "../controllers/getUserRelationshipDate";

const router = express.Router();

router.get("/relationship-date", getUserRelationshipDateController);

export { router as getUserRelationshipDateRouter };
