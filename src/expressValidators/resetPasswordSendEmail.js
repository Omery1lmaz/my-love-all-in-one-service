"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const resetPasswordSendEmailExpressValidator = [
    (0, express_validator_1.body)("email").isEmail().notEmpty().withMessage("email gereklidir"),
];
exports.default = resetPasswordSendEmailExpressValidator;
