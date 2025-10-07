"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getStorageInfo_1 = require("../photoControllers/getStorageInfo");
const router = (0, express_1.Router)();
router.get("/storage-info", getStorageInfo_1.getStorageInfoController);
exports.default = router;
