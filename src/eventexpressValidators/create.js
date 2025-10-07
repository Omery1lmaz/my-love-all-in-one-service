"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const createOrderExpressValidator = [
    (0, express_validator_1.body)("products")
        .isArray({ min: 1 })
        .withMessage("Products must be a non-empty array"),
    (0, express_validator_1.body)("products.*.seller")
        .isMongoId()
        .withMessage("Each product must have a valid seller ID"),
    (0, express_validator_1.body)("name").isString().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("shippingAddress")
        .optional()
        .isMongoId()
        .withMessage("Invalid shipping address ID"),
    (0, express_validator_1.body)("orderMessage")
        .optional()
        .isString()
        .withMessage("Order message must be a string"),
    (0, express_validator_1.body)("totalPrice").isNumeric().withMessage("Total price must be a number"),
    (0, express_validator_1.body)("isTakeAway").isBoolean().withMessage("isTakeAway must be a boolean"),
    (0, express_validator_1.body)("discount._id")
        .optional()
        .isMongoId()
        .withMessage("Invalid discount ID"),
    (0, express_validator_1.body)("tip.cost").optional().isNumeric().withMessage("Tip must be a number"),
];
exports.default = createOrderExpressValidator;
