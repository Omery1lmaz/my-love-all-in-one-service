import { body } from "express-validator";
const checkRegisterEmailExpressValidator = [
  body("email").isString().isEmail().notEmpty().withMessage("name gereklidir"),
];
export default checkRegisterEmailExpressValidator;
