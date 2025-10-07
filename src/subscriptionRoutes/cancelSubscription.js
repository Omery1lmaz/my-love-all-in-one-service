"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscriptionRouter = void 0;
const express_1 = require("express");
const common_1 = require("@heaven-nsoft/common");
const cancelSubscription_1 = require("../subscriptionControllers/cancelSubscription");
const router = (0, express_1.Router)();
exports.cancelSubscriptionRouter = router;
router.delete("/", common_1.requireAuth, cancelSubscription_1.cancelSubscription);
