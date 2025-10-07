"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const forgetPasswordResendOTPExpressValidator = [
    (0, express_validator_1.param)("token").trim().notEmpty().withMessage("token gereklidir"),
    (0, express_validator_1.param)("email")
        .trim()
        .notEmpty()
        .isEmail()
        .withMessage("Geçersiz email adresi"),
];
exports.default = forgetPasswordResendOTPExpressValidator;
