import { body, param } from "express-validator";
const updateUserHobbiesExpressValidator = [
  body("hobbies")
    .isArray()
    .withMessage("hobbies bir array olmalıdır")
    .custom((hobbies) => {
      if (!Array.isArray(hobbies)) return false;
      return hobbies.every((hobby) => {
        return typeof hobby === "string";
      });
    })
    .withMessage("Hobiler string olmalıdır"),
];
export default updateUserHobbiesExpressValidator;
