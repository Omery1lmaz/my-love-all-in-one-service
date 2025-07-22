import { param } from "express-validator";
const getProductsBySellerLimitExpressValidator = [
  param("limit")
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  param("skip")
    .isInt({ min: 0 })
    .withMessage("Skip must be a non-negative integer"),
];
export default getProductsBySellerLimitExpressValidator;
