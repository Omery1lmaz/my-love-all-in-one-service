"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const getProductsBySellerForClientExpressValidator = [
    (0, express_validator_1.param)("id").isEmpty().isMongoId().withMessage("id must be a string"),
];
exports.default = getProductsBySellerForClientExpressValidator;
