import { param } from "express-validator";
const forgetPasswordResendOTPExpressValidator = [
  param("token").trim().notEmpty().withMessage("serverAuthCode gereklidir"),
  param("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("serverAuthCode gereklidir"),
];
export default forgetPasswordResendOTPExpressValidator;
