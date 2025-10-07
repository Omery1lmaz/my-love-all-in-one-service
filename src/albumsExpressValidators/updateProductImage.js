"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductExpressValidation = void 0;
const express_validator_1 = require("express-validator");
exports.updateProductExpressValidation = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid product ID"),
];
exports.default = exports.updateProductExpressValidation;
