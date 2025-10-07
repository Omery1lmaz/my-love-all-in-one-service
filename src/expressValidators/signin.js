"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const signinExpressValidator = [
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Geçerli bir email giriniz"),
    (0, express_validator_1.body)("password").trim().notEmpty().withMessage("Şifre gereklidir"),
];
exports.default = signinExpressValidator;
