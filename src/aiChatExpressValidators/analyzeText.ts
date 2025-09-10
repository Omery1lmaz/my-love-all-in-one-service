import { body } from "express-validator";

export const analyzeTextValidator = [
  body("text")
    .notEmpty()
    .withMessage("Analiz edilecek metin gereklidir")
    .isLength({ min: 10, max: 10000 })
    .withMessage("Metin 10-10000 karakter arasında olmalıdır"),
  
  body("analysisType")
    .optional()
    .isIn(["summary", "sentiment", "keywords", "translation"])
    .withMessage("Geçersiz analiz türü"),
  
  body("targetLanguage")
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage("Hedef dil kodu 2-5 karakter arasında olmalıdır")
];
