import { param } from "express-validator";
const verifyPartnerCodeExpressValidator = [
  param("otp")
    .notEmpty()
    .isNumeric()
    .withMessage("OTP sadece rakamlardan oluşmalıdır"),
];

export default verifyPartnerCodeExpressValidator;
