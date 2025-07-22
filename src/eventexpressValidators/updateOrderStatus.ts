import { body, param } from "express-validator";
const validOrderStatuses = ["Pending", "Processing", "Completed", "Cancelled"];

const updateOrderStatusExpressValidator = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("status")
    .isString()
    .isIn(validOrderStatuses)
    .withMessage("Invalid status value"),
];
export default updateOrderStatusExpressValidator;
