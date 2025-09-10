import { body } from "express-validator";

export const analyzeImageValidator = [
  body("imageUrl")
    .notEmpty()
    .withMessage("Görsel URL'si gereklidir")
    .isURL()
    .withMessage("Geçerli bir URL giriniz"),
  
  body("prompt")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Prompt 5-500 karakter arasında olmalıdır")
];
