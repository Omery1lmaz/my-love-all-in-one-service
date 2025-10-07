"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const checkRegisterEmailExpressValidator = [
    (0, express_validator_1.body)("email").isString().isEmail().notEmpty().withMessage("name gereklidir"),
];
exports.default = checkRegisterEmailExpressValidator;
