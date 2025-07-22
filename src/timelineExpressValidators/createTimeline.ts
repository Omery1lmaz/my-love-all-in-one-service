import { body } from "express-validator";
const createTimelineExpressValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("type")
    .isIn([
      "anniversary",
      "first_meet",
      "first_date",
      "special_moment",
      "custom",
    ])
    .withMessage("Invalid event type"),
  body("isPrivate").optional().isBoolean(),
];
export default createTimelineExpressValidator;
