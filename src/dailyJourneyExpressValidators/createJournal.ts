import { body } from "express-validator";

const createJournalExpressValidator = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Başlık en fazla 200 karakter olabilir"),
  body("content").isString().trim().notEmpty().withMessage("İçerik boş olamaz"),
  body("mood")
    .optional()
    .isIn([
      "happy",
      "sad",
      "angry",
      "stressed",
      "excited",
      "tired",
      "peaceful",
      "anxious",
      "neutral",
    ])
    .withMessage("Geçerli bir ruh hali seçiniz"),
  body("isPrivate")
    .optional()
    .isBoolean()
    .withMessage("Gizlilik ayarı boolean olmalıdır"),
];

export default createJournalExpressValidator;
