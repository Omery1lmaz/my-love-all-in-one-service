"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionHistoryRouter = void 0;
const express_1 = require("express");
const common_1 = require("@heaven-nsoft/common");
const getSubscriptionHistory_1 = require("../subscriptionControllers/getSubscriptionHistory");
const router = (0, express_1.Router)();
exports.getSubscriptionHistoryRouter = router;
router.get("/", common_1.requireAuth, getSubscriptionHistory_1.getSubscriptionHistory);
