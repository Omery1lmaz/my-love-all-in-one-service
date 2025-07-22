import { body } from "express-validator";
const updateSpotifyTokensExpressValidator = [
  body("spotifyAccessToken")
    .trim()
    .notEmpty()
    .withMessage("spotifyAccessToken gereklidir"),
  body("spotifyRefreshToken")
    .trim()
    .notEmpty()
    .withMessage("spotifyRefreshToken gereklidir"),
  body("spotifyAccessTokenExpires")
    .trim()
    .notEmpty()
    .withMessage("spotifyAccessTokenExpires gereklidir"),
];
export default updateSpotifyTokensExpressValidator;
