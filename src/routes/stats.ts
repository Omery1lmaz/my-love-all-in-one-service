import express from "express";
import { getRelationshipStats } from "../controllers/stats";

const router = express.Router();

router.get("/get-relationship-stats", getRelationshipStats);

export { router as statsRouter };
