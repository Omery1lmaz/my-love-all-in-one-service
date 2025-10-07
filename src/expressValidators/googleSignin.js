"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const googleSigninExpressValidator = [
    (0, express_validator_1.body)("idToken").notEmpty().withMessage("idToken bir email giriniz"),
    (0, express_validator_1.body)("serverAuthCode")
        .trim()
        .notEmpty()
        .withMessage("serverAuthCode gereklidir"),
    (0, express_validator_1.body)("user").isObject().notEmpty().withMessage("user gereklidir"),
];
exports.default = googleSigninExpressValidator;
