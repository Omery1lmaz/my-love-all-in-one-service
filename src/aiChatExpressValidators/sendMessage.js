"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageValidator = void 0;
const express_validator_1 = require("express-validator");
exports.sendMessageValidator = [
    (0, express_validator_1.body)("sessionId")
        .isString()
        .withMessage("Session ID gereklidir"),
    (0, express_validator_1.body)("message")
        .isString()
        .withMessage("Mesaj gereklidir")
        .isLength({ min: 1, max: 1000 })
        .withMessage("Mesaj 1-1000 karakter arasında olmalıdır"),
];
