"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const getProductsBySellerLimitExpressValidator = [
    (0, express_validator_1.param)("limit")
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive integer"),
    (0, express_validator_1.param)("skip")
        .isInt({ min: 0 })
        .withMessage("Skip must be a non-negative integer"),
];
exports.default = getProductsBySellerLimitExpressValidator;
