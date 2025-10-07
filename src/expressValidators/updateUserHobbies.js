"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateUserHobbiesExpressValidator = [
    (0, express_validator_1.body)("hobbies")
        .isArray()
        .withMessage("hobbies bir array olmalıdır")
        .custom((hobbies) => {
        if (!Array.isArray(hobbies))
            return false;
        return hobbies.every((hobby) => {
            return typeof hobby === "string";
        });
    })
        .withMessage("Hobiler string olmalıdır"),
];
exports.default = updateUserHobbiesExpressValidator;
