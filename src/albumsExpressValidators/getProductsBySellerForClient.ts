import { param } from "express-validator";
const getProductsBySellerForClientExpressValidator = [
  param("id").isEmpty().isMongoId().withMessage("id must be a string"),
];
export default getProductsBySellerForClientExpressValidator;
