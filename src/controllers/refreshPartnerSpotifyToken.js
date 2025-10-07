"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const clientId = "bee83f2e9bd54f76ac500edf670599f3";
const clientSecret = "062ee3fc313441c1972172287d724fe5";
const refreshPartnerSpotifyTokenController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        if (!user.partnerSpotifyRefreshToken) {
            next(new my_love_common_1.BadRequestError("there is no user partner's spotify refresh token"));
            return;
        }
        const response = yield fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: `grant_type=refresh_token&refresh_token=${user.partnerSpotifyRefreshToken}`,
        });
        const data = yield response.json();
        if (data.error) {
            res.status(400).json({ message: "Spotify token yenileme hatası" });
            return;
        }
        user.partnerSpotifyAccessToken = data.access_token;
        user.partnerSpotifyAccessTokenExpires = new Date(Date.now() + data.expires_in * 1000);
        yield user.save();
        res.status(200).json({
            message: "Spotify token yenildi",
            status: "success",
            statusCode: 200,
            data: {
                spotifyAccessToken: user.partnerSpotifyAccessToken,
                spotifyAccessTokenExpires: user.partnerSpotifyAccessTokenExpires,
            },
        });
    }
    catch (error) {
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.default = refreshPartnerSpotifyTokenController;
