"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatSessionValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createChatSessionValidator = [
    (0, express_validator_1.body)("title")
        .optional()
        .isString()
        .withMessage("Başlık string olmalıdır")
        .isLength({ max: 100 })
        .withMessage("Başlık en fazla 100 karakter olabilir"),
    (0, express_validator_1.body)("coachType")
        .optional()
        .isIn(["general", "relationship_coach", "career_coach", "health_coach", "personal_development_coach", "financial_coach"])
        .withMessage("Geçersiz koç türü"),
    (0, express_validator_1.body)("coachId")
        .optional()
        .isString()
        .withMessage("Koç ID'si string olmalıdır"),
];
