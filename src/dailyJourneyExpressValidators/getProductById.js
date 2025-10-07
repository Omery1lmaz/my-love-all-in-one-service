"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const getProductByIdByIdExpressValidator = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid promotion ID"),
];
exports.default = getProductByIdByIdExpressValidator;
