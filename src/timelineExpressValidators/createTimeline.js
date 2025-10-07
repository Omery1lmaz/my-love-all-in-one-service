"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const createTimelineExpressValidator = [
    (0, express_validator_1.body)("title").notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("date").isISO8601().withMessage("Valid date is required"),
    (0, express_validator_1.body)("type")
        .isIn([
        "anniversary",
        "first_meet",
        "first_date",
        "special_moment",
        "custom",
    ])
        .withMessage("Invalid event type"),
    (0, express_validator_1.body)("isPrivate").optional().isBoolean(),
];
exports.default = createTimelineExpressValidator;
