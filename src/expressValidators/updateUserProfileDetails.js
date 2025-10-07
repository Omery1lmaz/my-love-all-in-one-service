"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateUserProfileDetailsExpressValidator = [
    (0, express_validator_1.body)("birthDate").isDate().notEmpty().withMessage("birthDate gereklidir"),
    (0, express_validator_1.body)("gender").isString().notEmpty().withMessage("gender gereklidir"),
];
exports.default = updateUserProfileDetailsExpressValidator;
