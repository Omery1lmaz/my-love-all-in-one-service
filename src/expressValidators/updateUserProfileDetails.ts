import { body } from "express-validator";
const updateUserProfileDetailsExpressValidator = [
  body("birthDate").isDate().notEmpty().withMessage("birthDate gereklidir"),
  body("gender").isString().notEmpty().withMessage("gender gereklidir"),
];

export default updateUserProfileDetailsExpressValidator;
