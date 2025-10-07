"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateUserFavoriteBookExpressValidator = [
    (0, express_validator_1.body)("favoriteBook")
        .isObject()
        .withMessage("favoriteBook bir obje olmalıdır")
        .custom((value) => {
        if (typeof value.name !== "string")
            throw new Error("name string olmalıdır");
        if (typeof value.link !== "string")
            throw new Error("link  string olmalıdır");
        if (typeof value.image !== "string")
            throw new Error("image string olmalıdır");
        return true;
    }),
];
exports.default = updateUserFavoriteBookExpressValidator;
