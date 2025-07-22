import { param } from "express-validator";
const resetPasswordVerifyOTPExpressValidator = [
  param("token").trim().notEmpty().withMessage("serverAuthCode gereklidir"),
  param("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("serverAuthCode gereklidir"),
  param("token").trim().notEmpty().withMessage("serverAuthCode gereklidir"),
];
export default resetPasswordVerifyOTPExpressValidator;
