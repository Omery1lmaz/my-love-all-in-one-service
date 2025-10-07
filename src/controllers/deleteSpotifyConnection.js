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
exports.deleteSpotifyConnectionController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const mongoose_1 = __importDefault(require("mongoose"));
const deleteSpotifyConnectionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("no token");
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            next(new common_1.NotFoundError());
            return;
        }
        // Kullanıcının kendi Spotify bilgilerini sil
        user.spotifyAccessToken = undefined;
        user.spotifyRefreshToken = undefined;
        user.spotifyAccessTokenExpires = undefined;
        // Eğer kullanıcının partneri varsa, partnerinin Spotify bilgilerini de sil
        if (user.partnerId) {
            const partner = yield user_1.User.findById(user.partnerId);
            if (partner) {
                partner.partnerSpotifyAccessToken = undefined;
                partner.partnerSpotifyRefreshToken = undefined;
                partner.partnerSpotifyAccessTokenExpires = undefined;
                yield partner.save();
            }
        }
        yield user.save();
        res.status(200).json({
            message: "Spotify bağlantısı başarıyla silindi",
            status: "success",
            statusCode: 200,
            data: {
                spotifyDisconnected: true,
                dailySongsCleared: true,
                sharedAlbumsCleared: true,
                partnerSpotifyDisconnected: user.partnerId ? true : false,
            },
        });
    }
    catch (error) {
        console.log(error, "error");
        res
            .status(400)
            .json({ message: "Spotify bağlantısı silinirken hata oluştu" });
    }
});
exports.deleteSpotifyConnectionController = deleteSpotifyConnectionController;
exports.default = exports.deleteSpotifyConnectionController;
