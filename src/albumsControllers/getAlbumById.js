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
exports.getAlbumById = void 0;
const album_1 = require("../Models/album");
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getAlbumById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const { id } = req.params;
        if (!authHeader) {
            next(new my_love_common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("err", err);
            next(new my_love_common_1.BadRequestError("Album ID is required"));
            return;
        }
        console.log(decodedToken.id, "decodedToken.id");
        const album = yield album_1.Album.findOne({
            _id: id,
            user: decodedToken.id,
        }).populate("photos coverPhoto");
        if (!album) {
            console.log("album", album);
            next(new my_love_common_1.BadRequestError("Album not found"));
            return;
        }
        res.status(200).json({
            message: "Album fetched successfully",
            data: album,
        });
    }
    catch (error) {
        console.error("Error fetching album:", error);
        next(new my_love_common_1.BadRequestError(error.message));
    }
});
exports.getAlbumById = getAlbumById;
exports.default = exports.getAlbumById;
