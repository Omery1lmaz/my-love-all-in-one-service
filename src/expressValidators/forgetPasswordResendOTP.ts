import { param } from "express-validator";
const forgetPasswordResendOTPExpressValidator = [
  param("token").trim().notEmpty().withMessage("token gereklidir"),
  param("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Geçersiz email adresi"),
];
export default forgetPasswordResendOTPExpressValidator;
