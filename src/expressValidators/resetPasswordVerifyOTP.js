"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const resetPasswordVerifyOTPExpressValidator = [
    (0, express_validator_1.param)("token").trim().notEmpty().withMessage("serverAuthCode gereklidir"),
    (0, express_validator_1.param)("email")
        .trim()
        .notEmpty()
        .isEmail()
        .withMessage("serverAuthCode gereklidir"),
    (0, express_validator_1.param)("token").trim().notEmpty().withMessage("serverAuthCode gereklidir"),
];
exports.default = resetPasswordVerifyOTPExpressValidator;
