import { param } from "express-validator";
const getEventByIdExpressValidator = [
  param("id")
    .isEmpty()
    .isString()
    .withMessage("id must be a string"),
];
export default getEventByIdExpressValidator;
