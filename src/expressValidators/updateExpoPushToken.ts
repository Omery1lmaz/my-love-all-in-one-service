import { body } from "express-validator";

export const updateExpoPushTokenValidator = [
  body("expoPushToken")
    .notEmpty()
    .withMessage("Expo push token is required")
    .isString()
    .withMessage("Expo push token must be a string")
    .isLength({ min: 1, max: 200 })
    .withMessage("Expo push token must be between 1 and 200 characters"),
];
