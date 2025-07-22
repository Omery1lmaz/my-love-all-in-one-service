import { param } from "express-validator";
const getProductsBySellerExpressValidator = [
  param("id").isMongoId().withMessage("Invalid promotion ID"),
];
export default getProductsBySellerExpressValidator;
