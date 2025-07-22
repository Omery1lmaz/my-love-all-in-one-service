import { body } from "express-validator";

const updateUserFavoriteMovieExpressValidator = [
  body("favoriteMovie")
    .isObject()
    .withMessage("favoriteMovie bir obje olmalıdır")
    .custom((value) => {
      if (!value.id) throw new Error("Film ID'si gereklidir");
      if (!value.title) throw new Error("Film başlığı gereklidir");
      if (!value.poster_path) throw new Error("Film poster yolu gereklidir");
      if (!value.release_date) throw new Error("Film yayın tarihi gereklidir");
      if (typeof value.adult !== "boolean")
        throw new Error("Adult değeri boolean olmalıdır");
      if (!Array.isArray(value.genre_ids))
        throw new Error("Genre ID'leri bir dizi olmalıdır");
      if (typeof value.vote_average !== "number")
        throw new Error("Ortalama oy sayısı sayı olmalıdır");
      if (typeof value.vote_count !== "number")
        throw new Error("Toplam oy sayısı sayı olmalıdır");
      return true;
    }),
];

export default updateUserFavoriteMovieExpressValidator;
