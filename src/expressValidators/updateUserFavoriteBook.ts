import { body } from "express-validator";

const updateUserFavoriteBookExpressValidator = [
  body("favoriteBook")
    .isObject()
    .withMessage("favoriteBook bir obje olmalıdır")
    .custom((value) => {
      if (typeof value.name !== "string")
        throw new Error("name string olmalıdır");
      if (typeof value.link !== "string")
        throw new Error("link  string olmalıdır");
      if (typeof value.image !== "string")
        throw new Error("image string olmalıdır");
      return true;
    }),
];

export default updateUserFavoriteBookExpressValidator;
