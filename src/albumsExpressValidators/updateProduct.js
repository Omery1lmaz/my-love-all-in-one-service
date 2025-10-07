"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductExpressValidation = void 0;
const express_validator_1 = require("express-validator");
exports.updateProductExpressValidation = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid product ID"),
    (0, express_validator_1.body)("name").optional().isString().withMessage("Name must be a string"),
    (0, express_validator_1.body)("imageUrl")
        .optional()
        .isString()
        .withMessage("Image URL must be a string"),
    (0, express_validator_1.body)("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),
    (0, express_validator_1.body)("status")
        .optional()
        .isBoolean()
        .withMessage("Status must be true or false"),
    (0, express_validator_1.body)("sellingPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Selling price must be a positive number"),
    (0, express_validator_1.body)("ownSellable")
        .optional()
        .isBoolean()
        .withMessage("Own sellable must be true or false"),
    (0, express_validator_1.body)("ingredients")
        .optional()
        .isArray()
        .withMessage("Ingredients must be an array of ObjectIds"),
    (0, express_validator_1.body)("extraIngredients")
        .optional()
        .isArray()
        .withMessage("Extra ingredients must be an array of ObjectIds"),
    (0, express_validator_1.body)("modifierGroups")
        .optional()
        .isArray()
        .withMessage("Modifier groups must be an array of ObjectIds"),
    (0, express_validator_1.body)("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
    (0, express_validator_1.body)("categoryAttributes")
        .optional()
        .isArray()
        .withMessage("Category attributes must be an array"),
];
exports.default = exports.updateProductExpressValidation;
