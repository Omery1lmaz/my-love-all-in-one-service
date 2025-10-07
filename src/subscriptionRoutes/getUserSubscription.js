"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubscriptionRouter = void 0;
const express_1 = require("express");
const getUserSubscription_1 = require("../subscriptionControllers/getUserSubscription");
const router = (0, express_1.Router)();
exports.getUserSubscriptionRouter = router;
router.get("/", getUserSubscription_1.getUserSubscription);
