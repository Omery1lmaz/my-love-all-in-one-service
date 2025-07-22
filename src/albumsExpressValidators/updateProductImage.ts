import { param } from "express-validator";
export const updateProductExpressValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),
];
export default updateProductExpressValidation;
