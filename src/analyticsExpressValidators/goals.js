"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoalsByCategoryValidator = exports.completeMilestoneValidator = exports.updateGoalProgressValidator = exports.updateGoalValidator = exports.getGoalsValidator = exports.createGoalValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createGoalValidator = [
    (0, express_validator_1.body)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string'),
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required')
        .isString()
        .withMessage('Title must be a string')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .notEmpty()
        .withMessage('Description is required')
        .isString()
        .withMessage('Description must be a string')
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    (0, express_validator_1.body)('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['communication', 'intimacy', 'trust', 'activities', 'conflict'])
        .withMessage('Category must be one of: communication, intimacy, trust, activities, conflict'),
    (0, express_validator_1.body)('targetValue')
        .notEmpty()
        .withMessage('Target value is required')
        .isNumeric()
        .withMessage('Target value must be a number')
        .isFloat({ min: 0 })
        .withMessage('Target value must be positive'),
    (0, express_validator_1.body)('deadline')
        .notEmpty()
        .withMessage('Deadline is required')
        .isISO8601()
        .withMessage('Deadline must be a valid date')
        .custom((value) => {
        const deadline = new Date(value);
        const now = new Date();
        if (deadline <= now) {
            throw new Error('Deadline must be in the future');
        }
        return true;
    }),
    (0, express_validator_1.body)('milestones')
        .optional()
        .isArray()
        .withMessage('Milestones must be an array'),
    (0, express_validator_1.body)('milestones.*.title')
        .optional()
        .isString()
        .withMessage('Milestone title must be a string')
        .isLength({ min: 3, max: 100 })
        .withMessage('Milestone title must be between 3 and 100 characters')
];
exports.getGoalsValidator = [
    (0, express_validator_1.query)('partnerId')
        .notEmpty()
        .withMessage('Partner ID is required')
        .isString()
        .withMessage('Partner ID must be a string'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['active', 'completed', 'paused', 'failed'])
        .withMessage('Status must be one of: active, completed, paused, failed')
];
exports.updateGoalValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Goal ID is required')
        .isMongoId()
        .withMessage('Goal ID must be a valid MongoDB ID'),
    (0, express_validator_1.body)('title')
        .optional()
        .isString()
        .withMessage('Title must be a string')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['communication', 'intimacy', 'trust', 'activities', 'conflict'])
        .withMessage('Category must be one of: communication, intimacy, trust, activities, conflict'),
    (0, express_validator_1.body)('targetValue')
        .optional()
        .isNumeric()
        .withMessage('Target value must be a number')
        .isFloat({ min: 0 })
        .withMessage('Target value must be positive'),
    (0, express_validator_1.body)('deadline')
        .optional()
        .isISO8601()
        .withMessage('Deadline must be a valid date'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'completed', 'paused', 'failed'])
        .withMessage('Status must be one of: active, completed, paused, failed')
];
exports.updateGoalProgressValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Goal ID is required')
        .isMongoId()
        .withMessage('Goal ID must be a valid MongoDB ID'),
    (0, express_validator_1.body)('currentValue')
        .notEmpty()
        .withMessage('Current value is required')
        .isNumeric()
        .withMessage('Current value must be a number')
        .isFloat({ min: 0 })
        .withMessage('Current value must be positive')
];
exports.completeMilestoneValidator = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Goal ID is required')
        .isMongoId()
        .withMessage('Goal ID must be a valid MongoDB ID'),
    (0, express_validator_1.param)('milestoneIndex')
        .notEmpty()
        .withMessage('Milestone index is required')
        .isInt({ min: 0 })
        .withMessage('Milestone index must be a non-negative integer')
];
exports.getGoalsByCategoryValidator = [
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
