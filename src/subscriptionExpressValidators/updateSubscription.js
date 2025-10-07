"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionValidator = void 0;
const express_validator_1 = require("express-validator");
exports.updateSubscriptionValidator = [
    (0, express_validator_1.body)("planType")
        .optional()
        .isIn(["free", "premium", "premium_plus"])
        .withMessage("Plan type must be one of: free, premium, premium_plus"),
    (0, express_validator_1.body)("autoRenew")
        .optional()
        .isBoolean()
        .withMessage("Auto renew must be a boolean value"),
    (0, express_validator_1.body)("paymentMethod")
        .optional()
        .isString()
        .isLength({ min: 1, max: 100 })
        .withMessage("Payment method must be a string between 1 and 100 characters"),
    (0, express_validator_1.body)("price")
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("currency")
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage("Currency must be a 3-character string (e.g., USD)"),
    (0, express_validator_1.body)("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO 8601 date string")
];
