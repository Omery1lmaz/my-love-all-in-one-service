"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updatePasswordExpressValidator = [
    (0, express_validator_1.body)("oldPassword")
        .isLength({ min: 6, max: 50 })
        .notEmpty()
        .withMessage("Geçerli bir email giriniz"),
    (0, express_validator_1.body)("newPassword")
        .isLength({ min: 6, max: 50 })
        .notEmpty()
        .withMessage("Geçerli bir email giriniz"),
    (0, express_validator_1.body)("newPasswordConfirm")
        .isLength({ min: 6, max: 50 })
        .notEmpty()
        .withMessage("Geçerli bir email giriniz"),
    (0, express_validator_1.body)("password").trim().notEmpty().withMessage("Şifre gereklidir"),
];
exports.default = updatePasswordExpressValidator;
