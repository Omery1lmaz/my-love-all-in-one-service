"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageValidator = void 0;
const express_validator_1 = require("express-validator");
exports.analyzeImageValidator = [
    (0, express_validator_1.body)("imageUrl")
        .notEmpty()
        .withMessage("Görsel URL'si gereklidir")
        .isURL()
        .withMessage("Geçerli bir URL giriniz"),
    (0, express_validator_1.body)("prompt")
        .optional()
        .isLength({ min: 5, max: 500 })
        .withMessage("Prompt 5-500 karakter arasında olmalıdır")
];
