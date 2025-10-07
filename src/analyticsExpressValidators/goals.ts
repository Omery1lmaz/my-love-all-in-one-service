import { body, query, param } from 'express-validator';

export const createGoalValidator = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['communication', 'intimacy', 'trust', 'activities', 'conflict'])
    .withMessage('Category must be one of: communication, intimacy, trust, activities, conflict'),
  body('targetValue')
    .notEmpty()
    .withMessage('Target value is required')
    .isNumeric()
    .withMessage('Target value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Target value must be positive'),
  body('deadline')
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
  body('milestones')
    .optional()
    .isArray()
    .withMessage('Milestones must be an array'),
  body('milestones.*.title')
    .optional()
    .isString()
    .withMessage('Milestone title must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Milestone title must be between 3 and 100 characters')
];

export const getGoalsValidator = [
  query('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required')
    .isString()
    .withMessage('Partner ID must be a string'),
  query('status')
    .optional()
    .isIn(['active', 'completed', 'paused', 'failed'])
    .withMessage('Status must be one of: active, completed, paused, failed')
];

export const updateGoalValidator = [
  param('id')
    .notEmpty()
    .withMessage('Goal ID is required')
    .isMongoId()
    .withMessage('Goal ID must be a valid MongoDB ID'),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['communication', 'intimacy', 'trust', 'activities', 'conflict'])
    .withMessage('Category must be one of: communication, intimacy, trust, activities, conflict'),
  body('targetValue')
    .optional()
    .isNumeric()
    .withMessage('Target value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Target value must be positive'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused', 'failed'])
    .withMessage('Status must be one of: active, completed, paused, failed')
];

export const updateGoalProgressValidator = [
  param('id')
    .notEmpty()
    .withMessage('Goal ID is required')
    .isMongoId()
    .withMessage('Goal ID must be a valid MongoDB ID'),
  body('currentValue')
    .notEmpty()
    .withMessage('Current value is required')
    .isNumeric()
    .withMessage('Current value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Current value must be positive')
];

export const completeMilestoneValidator = [
  param('id')
    .notEmpty()
    .withMessage('Goal ID is required')
    .isMongoId()
    .withMessage('Goal ID must be a valid MongoDB ID'),
  param('milestoneIndex')
    .notEmpty()
    .withMessage('Milestone index is required')
    .isInt({ min: 0 })
    .withMessage('Milestone index must be a non-negative integer')
];

export const getGoalsByCategoryValidator = [
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

