"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthScoreTrendsValidator = exports.getHealthScoreHistoryValidator = exports.getHealthScoreValidator = exports.calculateHealthScoreValidator = void 0;
const express_validator_1 = require("express-validator");
exports.calculateHealthScoreValidator = [
    (0, express_validator_1.body)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getHealthScoreValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getHealthScoreHistoryValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
exports.getHealthScoreTrendsValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string'),
    (0, express_validator_1.query)('days')
        .optional()
        .isInt({ min: 7, max: 365 })
        .withMessage('Days must be between 7 and 365')
];
