"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailablePlansRouter = void 0;
const express_1 = require("express");
const getAvailablePlans_1 = require("../subscriptionControllers/getAvailablePlans");
const router = (0, express_1.Router)();
exports.getAvailablePlansRouter = router;
router.get("/", getAvailablePlans_1.getAvailablePlans);
