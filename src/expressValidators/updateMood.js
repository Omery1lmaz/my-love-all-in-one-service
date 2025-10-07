"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateMoodExpressValidator = [
    (0, express_validator_1.body)("mood")
        .isIn([
        "happy",
        "sad",
        "angry",
        "stressed",
        "excited",
        "tired",
        "peaceful",
        "anxious",
    ])
        .withMessage("Geçerli bir mood seçiniz"),
    (0, express_validator_1.body)("note").optional().isString().withMessage("Not string olmalıdır"),
    (0, express_validator_1.body)("activities")
        .optional()
        .isArray()
        .withMessage("Aktiviteler bir dizi olmalıdır"),
    (0, express_validator_1.body)("activities.*")
        .optional()
        .isString()
        .withMessage("Her aktivite string olmalıdır"),
];
exports.default = updateMoodExpressValidator;
