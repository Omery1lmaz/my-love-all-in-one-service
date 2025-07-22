import { body } from "express-validator";
const updatePhoneNumberExpressValidator = [
  body("number").notEmpty().withMessage("number"),
];
export default updatePhoneNumberExpressValidator;
