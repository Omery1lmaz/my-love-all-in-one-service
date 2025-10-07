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
exports.updateSpotifyTokensController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const updateSpotifyTokensController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { spotifyAccessToken, spotifyRefreshToken, spotifyAccessTokenExpires } = req.body;
    console.log("updateSpotifyTokensController req.body", req.body);
    if (!authHeader) {
        console.log("updateSpotifyTokensController authHeader");
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("updateSpotifyTokensController token");
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            console.log("updateSpotifyTokensController user");
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        const partner = yield user_1.User.findById(user.partnerId);
        if (partner) {
            partner.partnerSpotifyAccessToken = spotifyAccessToken;
            partner.partnerSpotifyRefreshToken = spotifyRefreshToken;
            partner.partnerSpotifyAccessTokenExpires = spotifyAccessTokenExpires;
            yield partner.save();
        }
        user.spotifyAccessToken = spotifyAccessToken;
        user.spotifyRefreshToken = spotifyRefreshToken;
        user.spotifyAccessTokenExpires = spotifyAccessTokenExpires;
        yield user.save();
        res.status(200).json({
            message: "Spotify tokenları güncellendi",
            status: "success",
            statusCode: 200,
            data: {
                spotifyAccessToken: user.spotifyAccessToken,
                spotifyRefreshToken: user.spotifyRefreshToken,
                spotifyAccessTokenExpires: user.spotifyAccessTokenExpires,
            },
        });
    }
    catch (error) {
        console.log("updateSpotifyTokensController error", error);
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.updateSpotifyTokensController = updateSpotifyTokensController;
exports.default = exports.updateSpotifyTokensController;
