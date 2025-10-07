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
const clientId = "bee83f2e9bd54f76ac500edf670599f3";
const clientSecret = "062ee3fc313441c1972172287d724fe5";
const updateSharedSpotifyAlbumDetailController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const { name, label } = req.body;
    const { id } = req.params;
    console.log(id, "id");
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
        const partner = yield user_1.User.findOne({
            _id: user.partnerId,
            partnerId: user._id,
        });
        const albumIndex = (_a = user.sharedSpotifyAlbum) === null || _a === void 0 ? void 0 : _a.findIndex((item) => {
            return item.albumId == id;
        });
        console.log(albumIndex, "album index 1 tgest");
        if (partner) {
            const partnerAlbumIndex = (_b = partner.sharedSpotifyAlbum) === null || _b === void 0 ? void 0 : _b.findIndex((item) => {
                return item.albumId == id;
            });
            if (partner.sharedSpotifyAlbum && partner.sharedSpotifyAlbum[partnerAlbumIndex]) {
                console.log(partner.sharedSpotifyAlbum[partnerAlbumIndex], "shared album before update");
                partner.sharedSpotifyAlbum[partnerAlbumIndex].name = name;
                partner.sharedSpotifyAlbum[partnerAlbumIndex].label = label;
                yield partner.save();
                console.log(partner.sharedSpotifyAlbum[partnerAlbumIndex], "shared album before update");
            }
        }
        if (user.sharedSpotifyAlbum && user.sharedSpotifyAlbum[albumIndex]) {
            user.sharedSpotifyAlbum[albumIndex].name = name;
            user.sharedSpotifyAlbum[albumIndex].label = label;
        }
        ;
        yield user.save();
        console.log(user.sharedSpotifyAlbum[albumIndex], "shared album before update");
        res.status(200).json({
            message: "Spotify token yenildi",
            status: "success",
            statusCode: 200,
            data: {
                sharedAlbums: user.sharedSpotifyAlbum,
            },
        });
    }
    catch (error) {
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.default = updateSharedSpotifyAlbumDetailController;
