import express from "express";
import { updatePartnerInfo } from "../controllers/partner";

const router = express.Router();

router.put("/update-partner-info", updatePartnerInfo);

export { router as partnerRouter };
