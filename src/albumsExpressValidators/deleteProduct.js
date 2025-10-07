"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const deleteProductExpressValidator = [
    (0, express_validator_1.param)("id")
        .isEmpty()
        .isMongoId()
        .withMessage("Limit must be a positive integer"),
];
exports.default = deleteProductExpressValidator;
