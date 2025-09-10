import { body } from "express-validator";

export const updateChatSessionTitleValidator = [
  body("title")
    .isString()
    .withMessage("Başlık gereklidir")
    .isLength({ min: 1, max: 100 })
    .withMessage("Başlık 1-100 karakter arasında olmalıdır"),
];
