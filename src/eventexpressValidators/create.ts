import { body } from "express-validator";
const createOrderExpressValidator = [
  body("products")
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array"),
  body("products.*.seller")
    .isMongoId()
    .withMessage("Each product must have a valid seller ID"),
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("shippingAddress")
    .optional()
    .isMongoId()
    .withMessage("Invalid shipping address ID"),
  body("orderMessage")
    .optional()
    .isString()
    .withMessage("Order message must be a string"),
  body("totalPrice").isNumeric().withMessage("Total price must be a number"),
  body("isTakeAway").isBoolean().withMessage("isTakeAway must be a boolean"),
  body("discount._id")
    .optional()
    .isMongoId()
    .withMessage("Invalid discount ID"),
  body("tip.cost").optional().isNumeric().withMessage("Tip must be a number"),
];
export default createOrderExpressValidator;
