import { body } from "express-validator";

export const createChatSessionValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Başlık string olmalıdır")
    .isLength({ max: 100 })
    .withMessage("Başlık en fazla 100 karakter olabilir"),
  body("coachType")
    .optional()
    .isIn(["general", "relationship_coach", "career_coach", "health_coach", "personal_development_coach", "financial_coach"])
    .withMessage("Geçersiz koç türü"),
  body("coachId")
    .optional()
    .isString()
    .withMessage("Koç ID'si string olmalıdır"),
];
