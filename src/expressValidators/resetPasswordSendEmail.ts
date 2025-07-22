import { body } from "express-validator";
const resetPasswordSendEmailExpressValidator = [
  body("email").isEmail().notEmpty().withMessage("email gereklidir"),
];

export default resetPasswordSendEmailExpressValidator;
