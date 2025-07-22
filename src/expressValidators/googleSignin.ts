import { body } from "express-validator";
const googleSigninExpressValidator = [
  body("idToken").notEmpty().withMessage("idToken bir email giriniz"),
  body("serverAuthCode")
    .trim()
    .notEmpty()
    .withMessage("serverAuthCode gereklidir"),
  body("user").isObject().notEmpty().withMessage("user gereklidir"),
];
export default googleSigninExpressValidator;
