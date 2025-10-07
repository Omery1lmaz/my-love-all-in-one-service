import { body, query, param } from 'express-validator';

export const generateWeeklyReportValidator = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const generateMonthlyReportValidator = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getWeeklyReportValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getMonthlyReportValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string')
];

export const getReportByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Report ID is required')
    .isMongoId()
    .withMessage('Report ID must be a valid MongoDB ID')
];

export const getReportHistoryValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string'),
  query('type')
    .optional()
    .isIn(['weekly', 'monthly', 'quarterly'])
    .withMessage('Type must be one of: weekly, monthly, quarterly'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

export const generateReportSummaryValidator = [
  param('id')
    .notEmpty()
    .withMessage('Report ID is required')
    .isMongoId()
    .withMessage('Report ID must be a valid MongoDB ID')
];

export const shareReportValidator = [
  param('id')
    .notEmpty()
    .withMessage('Report ID is required')
    .isMongoId()
    .withMessage('Report ID must be a valid MongoDB ID'),
  body('shareWith')
    .notEmpty()
    .withMessage('Share target is required')
    .isString()
    .withMessage('Share target must be a string')
];

export const deleteReportValidator = [
  param('id')
    .notEmpty()
    .withMessage('Report ID is required')
    .isMongoId()
    .withMessage('Report ID must be a valid MongoDB ID')
];

