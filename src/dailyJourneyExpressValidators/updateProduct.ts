import { param, body } from "express-validator";
export const updateProductExpressValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),
  body("name").optional().isString().withMessage("Name must be a string"),
  body("imageUrl")
    .optional()
    .isString()
    .withMessage("Image URL must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be true or false"),
  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),
  body("ownSellable")
    .optional()
    .isBoolean()
    .withMessage("Own sellable must be true or false"),
  body("ingredients")
    .optional()
    .isArray()
    .withMessage("Ingredients must be an array of ObjectIds"),
  body("extraIngredients")
    .optional()
    .isArray()
    .withMessage("Extra ingredients must be an array of ObjectIds"),
  body("modifierGroups")
    .optional()
    .isArray()
    .withMessage("Modifier groups must be an array of ObjectIds"),
  body("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  body("categoryAttributes")
    .optional()
    .isArray()
    .withMessage("Category attributes must be an array"),
];
export default updateProductExpressValidation;
