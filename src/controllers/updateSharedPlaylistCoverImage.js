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
const updateSharedPlaylistCoverImageController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const authHeader = req.headers.authorization;
    const { images } = req.body;
    const { id } = req.params;
    console.log("test images test");
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
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        if (user.partnerId) {
            const partner = yield user_1.User.findOne({
                _id: user.partnerId,
                partnerId: user._id,
            });
            if (partner) {
                const partnerAlbumIndex = (_a = partner.sharedSpotifyAlbum) === null || _a === void 0 ? void 0 : _a.findIndex((item) => {
                    return item.albumId == id;
                });
                if (partner.sharedSpotifyAlbum && partner.sharedSpotifyAlbum[partnerAlbumIndex]) {
                    partner.sharedSpotifyAlbum[partnerAlbumIndex].images = images;
                    yield partner.save();
                }
            }
        }
        console.log(user.sharedSpotifyAlbum, id);
        const existsharedAlbumIndex = (_b = user.sharedSpotifyAlbum) === null || _b === void 0 ? void 0 : _b.findIndex((item) => item.albumId === id);
        if (existsharedAlbumIndex === undefined ||
            existsharedAlbumIndex < 0 ||
            !user.sharedSpotifyAlbum ||
            !user.sharedSpotifyAlbum[existsharedAlbumIndex]) {
            console.log(`[Album Error] Shared album not found for albumId: ${id}`);
            next(new my_love_common_1.BadRequestError("[Album Error] Shared album not found for albumId"));
            return;
        }
        user.sharedSpotifyAlbum[existsharedAlbumIndex].images = images;
        user.save();
        res.status(200).json({
            message: "Album cover photo updated",
            status: "success",
            statusCode: 200,
            data: {
                albums: user.sharedSpotifyAlbum
            },
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.default = updateSharedPlaylistCoverImageController;
