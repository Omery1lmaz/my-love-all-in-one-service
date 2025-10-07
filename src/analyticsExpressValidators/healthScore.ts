import { body, query } from 'express-validator';

export const calculateHealthScoreValidator = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getHealthScoreValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getHealthScoreHistoryValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const getHealthScoreTrendsValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string'),
  query('days')
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage('Days must be between 7 and 365')
];

