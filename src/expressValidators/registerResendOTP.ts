import { param } from "express-validator";
const registerResendExpressValidator = [
  param("token").notEmpty().withMessage("token gereklidir"),
];
export default registerResendExpressValidator;
