"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const verifyPartnerCodeExpressValidator = [
    (0, express_validator_1.param)("otp")
        .notEmpty()
        .isNumeric()
        .withMessage("OTP sadece rakamlardan oluşmalıdır"),
];
exports.default = verifyPartnerCodeExpressValidator;
