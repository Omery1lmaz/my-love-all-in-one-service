import { body } from "express-validator";

const updateMoodExpressValidator = [
  body("mood")
    .isIn([
      "happy",
      "sad",
      "angry",
      "stressed",
      "excited",
      "tired",
      "peaceful",
      "anxious",
    ])
    .withMessage("Geçerli bir mood seçiniz"),
  body("note").optional().isString().withMessage("Not string olmalıdır"),
  body("activities")
    .optional()
    .isArray()
    .withMessage("Aktiviteler bir dizi olmalıdır"),
  body("activities.*")
    .optional()
    .isString()
    .withMessage("Her aktivite string olmalıdır"),
];

export default updateMoodExpressValidator;
