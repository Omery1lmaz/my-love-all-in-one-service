"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTextValidator = void 0;
const express_validator_1 = require("express-validator");
exports.analyzeTextValidator = [
    (0, express_validator_1.body)("text")
        .notEmpty()
        .withMessage("Analiz edilecek metin gereklidir")
        .isLength({ min: 10, max: 10000 })
        .withMessage("Metin 10-10000 karakter arasında olmalıdır"),
    (0, express_validator_1.body)("analysisType")
        .optional()
        .isIn(["summary", "sentiment", "keywords", "translation"])
        .withMessage("Geçersiz analiz türü"),
    (0, express_validator_1.body)("targetLanguage")
        .optional()
        .isLength({ min: 2, max: 5 })
        .withMessage("Hedef dil kodu 2-5 karakter arasında olmalıdır")
];
