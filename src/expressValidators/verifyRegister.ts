import { param } from "express-validator";
const verifyRegisterExpressValidator = [
  param("token").notEmpty().withMessage("Token gereklidir"),
  param("otp")
    .notEmpty()
    .isNumeric()
    .withMessage("OTP sadece rakamlardan oluşmalıdır"),
];

export default verifyRegisterExpressValidator;
