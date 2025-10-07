"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const createEventExpressValidator = [
    (0, express_validator_1.body)("eventType")
        .isEmpty()
        .isString()
        .isIn([
        "birthday",
        "anniversary",
        "meeting",
        "holiday",
        "date",
        "gift_exchange",
        "travel",
        "celebration",
        "custom",
    ])
        .withMessage("eventType must be a valid event type"),
];
exports.default = createEventExpressValidator;
