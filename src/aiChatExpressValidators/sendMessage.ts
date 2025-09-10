import { body } from "express-validator";

export const sendMessageValidator = [
  body("sessionId")
    .isString()
    .withMessage("Session ID gereklidir"),
  body("message")
    .isString()
    .withMessage("Mesaj gereklidir")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Mesaj 1-1000 karakter arasında olmalıdır"),
];
