"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validOrderStatuses = ["Pending", "Processing", "Completed", "Cancelled"];
const updateOrderStatusExpressValidator = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid order ID"),
    (0, express_validator_1.body)("status")
        .isString()
        .isIn(validOrderStatuses)
        .withMessage("Invalid status value"),
];
exports.default = updateOrderStatusExpressValidator;
