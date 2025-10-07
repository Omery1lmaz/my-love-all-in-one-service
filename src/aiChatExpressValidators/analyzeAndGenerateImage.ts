import { body } from "express-validator";

export const analyzeAndGenerateImageValidator = [
  body("style")
    .optional()
    .isIn(["realistic", "cartoon", "anime", "watercolor", "oil_painting", "digital_art"])
    .withMessage("Style must be one of: realistic, cartoon, anime, watercolor, oil_painting, digital_art"),

  body("additionalPrompt")
    .optional()
    .isString()
    .isLength({ min: 0, max: 500 })
    .withMessage("Additional prompt must be a string with maximum 500 characters"),
];
