import { body } from "express-validator";
const signinExpressValidator = [
  body("email").notEmpty().isEmail().withMessage("Geçerli bir email giriniz"),
  body("password").trim().notEmpty().withMessage("Şifre gereklidir"),
];

export default signinExpressValidator;
