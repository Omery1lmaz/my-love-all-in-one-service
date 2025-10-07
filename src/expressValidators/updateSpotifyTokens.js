"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const updateSpotifyTokensExpressValidator = [
    (0, express_validator_1.body)("spotifyAccessToken")
        .trim()
        .notEmpty()
        .withMessage("spotifyAccessToken gereklidir"),
    (0, express_validator_1.body)("spotifyRefreshToken")
        .trim()
        .notEmpty()
        .withMessage("spotifyRefreshToken gereklidir"),
    (0, express_validator_1.body)("spotifyAccessTokenExpires")
        .trim()
        .notEmpty()
        .withMessage("spotifyAccessTokenExpires gereklidir"),
];
exports.default = updateSpotifyTokensExpressValidator;
