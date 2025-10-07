"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateUserNameExpressValidator = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .isString()
        .isLength({ min: 3 })
        .withMessage("name gereklidir"),
];
exports.default = updateUserNameExpressValidator;
