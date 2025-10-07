"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const addTiptoOrderExpressValidator = [
    (0, express_validator_1.body)("tip.cost")
        .isNumeric()
        .withMessage("Tip cost must be a number")
        .notEmpty()
        .withMessage("Tip cost is required"),
    (0, express_validator_1.body)("seller").isMongoId().withMessage("Invalid seller ID"),
];
exports.default = addTiptoOrderExpressValidator;
