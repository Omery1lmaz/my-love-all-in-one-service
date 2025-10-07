"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const registerResendExpressValidator = [
    (0, express_validator_1.param)("token").notEmpty().withMessage("token gereklidir"),
];
exports.default = registerResendExpressValidator;
