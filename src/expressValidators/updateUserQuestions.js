"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateUserQuestionsExpressValidator = [
    (0, express_validator_1.body)("questions")
        .isArray()
        .withMessage("questions bir array olmalıdır")
        .custom((questions) => {
        if (!Array.isArray(questions))
            return false;
        return questions.every((q) => {
            return (typeof q === "object" &&
                q !== null &&
                "question" in q &&
                "answer" in q &&
                typeof q.question === "string" &&
                typeof q.answer === "string");
        });
    })
        .withMessage("Her soru için question ve answer değerleri gereklidir"),
];
exports.default = updateUserQuestionsExpressValidator;
