import { body } from "express-validator";
const createEventExpressValidator = [
  body("eventType")
    .isEmpty()
    .isString()
    .isIn([
      "birthday",
      "anniversary",
      "meeting",
      "holiday",
      "date",
      "gift_exchange",
      "travel",
      "celebration",
      "custom",
    ])
    .withMessage("eventType must be a valid event type"),
];
export default createEventExpressValidator;
