"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpoPushTokenValidator = void 0;
const express_validator_1 = require("express-validator");
exports.updateExpoPushTokenValidator = [
    (0, express_validator_1.body)("expoPushToken")
        .notEmpty()
        .withMessage("Expo push token is required")
        .isString()
        .withMessage("Expo push token must be a string")
        .isLength({ min: 1, max: 200 })
        .withMessage("Expo push token must be between 1 and 200 characters"),
];
