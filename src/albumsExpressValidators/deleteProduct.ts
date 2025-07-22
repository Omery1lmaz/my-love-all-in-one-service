import { param } from "express-validator";
const deleteProductExpressValidator = [
  param("id")
    .isEmpty()
    .isMongoId()
    .withMessage("Limit must be a positive integer"),
];
export default deleteProductExpressValidator;
