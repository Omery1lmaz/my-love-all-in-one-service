"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validOrderStatuses = ["Pending", "Processing", "Completed", "Cancelled"];
const updateOrderStatustoCancelExpressValidator = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid order ID"),
    (0, express_validator_1.check)("reason")
        .trim()
        .notEmpty()
        .withMessage("Cancellation reason is required")
        .isLength({ min: 5 })
        .withMessage("Cancellation reason must be at least 5 characters long"),
];
exports.default = updateOrderStatustoCancelExpressValidator;
