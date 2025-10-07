"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const getEventByIdExpressValidator = [
    (0, express_validator_1.param)("id")
        .isEmpty()
        .isString()
        .withMessage("id must be a string"),
];
exports.default = getEventByIdExpressValidator;
