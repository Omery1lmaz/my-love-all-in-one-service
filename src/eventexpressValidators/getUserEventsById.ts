import { param } from "express-validator";
const getEventByIdExpressValidator = [
  param("id")
    .isEmpty()
    .isString()
    .isMongoId()
    .withMessage("id must be a string"),
];
export default getEventByIdExpressValidator;
