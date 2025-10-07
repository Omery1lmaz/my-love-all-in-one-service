"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const verifyRegisterExpressValidator = [
    (0, express_validator_1.param)("token").notEmpty().withMessage("Token gereklidir"),
    (0, express_validator_1.param)("otp")
        .notEmpty()
        .isNumeric()
        .withMessage("OTP sadece rakamlardan oluşmalıdır"),
];
exports.default = verifyRegisterExpressValidator;
