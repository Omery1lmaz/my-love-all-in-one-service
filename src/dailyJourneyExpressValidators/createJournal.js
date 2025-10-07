"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const createJournalExpressValidator = [
    (0, express_validator_1.body)("title")
        .optional()
        .isString()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Başlık en fazla 200 karakter olabilir"),
    (0, express_validator_1.body)("content").isString().trim().notEmpty().withMessage("İçerik boş olamaz"),
    (0, express_validator_1.body)("mood")
        .optional()
        .isIn([
        "happy",
        "sad",
        "angry",
        "stressed",
        "excited",
        "tired",
        "peaceful",
        "anxious",
        "neutral",
    ])
        .withMessage("Geçerli bir ruh hali seçiniz"),
    (0, express_validator_1.body)("isPrivate")
        .optional()
        .isBoolean()
        .withMessage("Gizlilik ayarı boolean olmalıdır"),
];
exports.default = createJournalExpressValidator;
