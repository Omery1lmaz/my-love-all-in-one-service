"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReportValidator = exports.shareReportValidator = exports.generateReportSummaryValidator = exports.getReportHistoryValidator = exports.getReportByIdValidator = exports.getMonthlyReportValidator = exports.getWeeklyReportValidator = exports.generateMonthlyReportValidator = exports.generateWeeklyReportValidator = void 0;
const express_validator_1 = require("express-validator");
exports.generateWeeklyReportValidator = [
    (0, express_validator_1.body)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.generateMonthlyReportValidator = [
    (0, express_validator_1.body)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getWeeklyReportValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getMonthlyReportValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string')
];
exports.getReportByIdValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Report ID is required')
        .isMongoId()
        .withMessage('Report ID must be a valid MongoDB ID')
];
exports.getReportHistoryValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['weekly', 'monthly', 'quarterly'])
        .withMessage('Type must be one of: weekly, monthly, quarterly'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
];
exports.generateReportSummaryValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Report ID is required')
        .isMongoId()
        .withMessage('Report ID must be a valid MongoDB ID')
];
exports.shareReportValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Report ID is required')
        .isMongoId()
        .withMessage('Report ID must be a valid MongoDB ID'),
    (0, express_validator_1.body)('shareWith')
        .notEmpty()
        .withMessage('Share target is required')
        .isString()
        .withMessage('Share target must be a string')
];
exports.deleteReportValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Report ID is required')
        .isMongoId()
        .withMessage('Report ID must be a valid MongoDB ID')
];
