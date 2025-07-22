import { param } from "express-validator";
const resetPasswrodExpressValidator = [
  param("otp").trim().notEmpty().withMessage("otp gereklidir"),
  param("token").trim().notEmpty().withMessage("token gereklidir"),
  param("email").trim().notEmpty().withMessage("email gereklidir"),
  param("password").trim().notEmpty().withMessage("password gereklidir"),
];
export default resetPasswrodExpressValidator;
