"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updatePhoneNumberExpressValidator = [
    (0, express_validator_1.body)("number").notEmpty().withMessage("number"),
];
exports.default = updatePhoneNumberExpressValidator;
