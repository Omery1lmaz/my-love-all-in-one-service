import { body } from "express-validator";
const updatePasswordExpressValidator = [
  body("oldPassword")
    .isLength({ min: 6, max: 50 })
    .notEmpty()
    .withMessage("Geçerli bir email giriniz"),
  body("newPassword")
    .isLength({ min: 6, max: 50 })
    .notEmpty()
    .withMessage("Geçerli bir email giriniz"),
  body("newPasswordConfirm")
    .isLength({ min: 6, max: 50 })
    .notEmpty()
    .withMessage("Geçerli bir email giriniz"),

  body("password").trim().notEmpty().withMessage("Şifre gereklidir"),
];

export default updatePasswordExpressValidator;
