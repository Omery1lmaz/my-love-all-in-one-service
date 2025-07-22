import { body } from "express-validator";
const addTiptoOrderExpressValidator = [
  body("tip.cost")
    .isNumeric()
    .withMessage("Tip cost must be a number")
    .notEmpty()
    .withMessage("Tip cost is required"),
  body("seller").isMongoId().withMessage("Invalid seller ID"),
];
export default addTiptoOrderExpressValidator;
