import { body, query, param } from 'express-validator';

export const generateInsightsValidator = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const generateAIInsightsValidator = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getInsightsValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string'),
  query('type')
    .optional()
    .isIn(['positive', 'warning', 'suggestion', 'achievement'])
    .withMessage('Type must be one of: positive, warning, suggestion, achievement'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const getInsightsByCategoryValidator = [
  param('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['communication', 'intimacy', 'trust', 'activities', 'conflict'])
    .withMessage('Category must be one of: communication, intimacy, trust, activities, conflict'),
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getInsightByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Insight ID is required')
    .isMongoId()
    .withMessage('Insight ID must be a valid MongoDB ID')
];

export const markInsightAsReadValidator = [
  param('id')
    .notEmpty()
    .withMessage('Insight ID is required')
    .isMongoId()
    .withMessage('Insight ID must be a valid MongoDB ID')
];

export const markInsightAsAppliedValidator = [
  param('id')
    .notEmpty()
    .withMessage('Insight ID is required')
    .isMongoId()
    .withMessage('Insight ID must be a valid MongoDB ID')
];

export const dismissInsightValidator = [
  param('id')
    .notEmpty()
    .withMessage('Insight ID is required')
    .isMongoId()
    .withMessage('Insight ID must be a valid MongoDB ID')
];

export const getPriorityInsightsValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

