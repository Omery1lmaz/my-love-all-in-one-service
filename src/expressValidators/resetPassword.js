"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const resetPasswrodExpressValidator = [
    (0, express_validator_1.param)("otp").trim().notEmpty().withMessage("otp gereklidir"),
    (0, express_validator_1.param)("token").trim().notEmpty().withMessage("token gereklidir"),
    (0, express_validator_1.param)("email").trim().notEmpty().withMessage("email gereklidir"),
    (0, express_validator_1.param)("password").trim().notEmpty().withMessage("password gereklidir"),
];
exports.default = resetPasswrodExpressValidator;
