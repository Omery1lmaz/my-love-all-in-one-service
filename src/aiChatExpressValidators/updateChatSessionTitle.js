"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatSessionTitleValidator = void 0;
const express_validator_1 = require("express-validator");
exports.updateChatSessionTitleValidator = [
    (0, express_validator_1.body)("title")
        .isString()
        .withMessage("Başlık gereklidir")
        .isLength({ min: 1, max: 100 })
        .withMessage("Başlık 1-100 karakter arasında olmalıdır"),
];
