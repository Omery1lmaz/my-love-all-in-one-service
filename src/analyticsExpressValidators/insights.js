"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriorityInsightsValidator = exports.dismissInsightValidator = exports.markInsightAsAppliedValidator = exports.markInsightAsReadValidator = exports.getInsightByIdValidator = exports.getInsightsByCategoryValidator = exports.getInsightsValidator = exports.generateAIInsightsValidator = exports.generateInsightsValidator = void 0;
const express_validator_1 = require("express-validator");
exports.generateInsightsValidator = [
    (0, express_validator_1.body)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.generateAIInsightsValidator = [
    (0, express_validator_1.body)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getInsightsValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['positive', 'warning', 'suggestion', 'achievement'])
        .withMessage('Type must be one of: positive, warning, suggestion, achievement'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
exports.getInsightsByCategoryValidator = [
    (0, express_validator_1.param)('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['communication', 'intimacy', 'trust', 'activities', 'conflict'])
        .withMessage('Category must be one of: communication, intimacy, trust, activities, conflict'),
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getInsightByIdValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Insight ID is required')
        .isMongoId()
        .withMessage('Insight ID must be a valid MongoDB ID')
];
exports.markInsightAsReadValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Insight ID is required')
        .isMongoId()
        .withMessage('Insight ID must be a valid MongoDB ID')
];
exports.markInsightAsAppliedValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Insight ID is required')
        .isMongoId()
        .withMessage('Insight ID must be a valid MongoDB ID')
];
exports.dismissInsightValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Insight ID is required')
        .isMongoId()
        .withMessage('Insight ID must be a valid MongoDB ID')
];
exports.getPriorityInsightsValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
