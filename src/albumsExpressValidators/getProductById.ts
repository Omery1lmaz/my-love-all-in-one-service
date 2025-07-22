import { param } from "express-validator";
const getProductByIdByIdExpressValidator = [
  param("id").isMongoId().withMessage("Invalid promotion ID"),
];
export default getProductByIdByIdExpressValidator;
