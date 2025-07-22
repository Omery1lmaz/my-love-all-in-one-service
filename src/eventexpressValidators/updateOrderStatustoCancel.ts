import { body, check, param } from "express-validator";
const validOrderStatuses = ["Pending", "Processing", "Completed", "Cancelled"];

const updateOrderStatustoCancelExpressValidator = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  check("reason")
    .trim()
    .notEmpty()
    .withMessage("Cancellation reason is required")
    .isLength({ min: 5 })
    .withMessage("Cancellation reason must be at least 5 characters long"),
];
export default updateOrderStatustoCancelExpressValidator;
