import { Router } from "express";
import { getStorageInfoController } from "../photoControllers/getStorageInfo";

const router = Router();

router.get("/storage-info", getStorageInfoController);

export default router;
