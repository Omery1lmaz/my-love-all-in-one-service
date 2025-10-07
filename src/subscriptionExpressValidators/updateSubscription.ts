import { body } from "express-validator";

export const updateSubscriptionValidator = [
  body("planType")
    .optional()
    .isIn(["free", "premium", "premium_plus"])
    .withMessage("Plan type must be one of: free, premium, premium_plus"),
  
  body("autoRenew")
    .optional()
    .isBoolean()
    .withMessage("Auto renew must be a boolean value"),
  
  body("paymentMethod")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("Payment method must be a string between 1 and 100 characters"),
  
  body("price")
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  
  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character string (e.g., USD)"),
  
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date string")
];
