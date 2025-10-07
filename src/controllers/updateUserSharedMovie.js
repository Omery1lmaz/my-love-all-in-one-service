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
exports.updateSharedUserMovieController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const updateSharedUserMovieController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { movie, note, isShared } = req.body;
    console.log(movie, "movie");
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
        const updateMovie = {
            isShared,
            note,
            movie,
            createdBy: "me"
        };
        console.log(updateMovie, "updateMovie");
        console.log(isShared, "isShared");
        user.sharedMovies.push({
            isShared,
            note,
            movie,
            createdBy: "me"
        });
        yield user.save();
        // Eğer isShared true ise partnerin sharedMovies'ine de ekle
        if (isShared && user.partnerId) {
            const partner = yield user_1.User.findById(user.partnerId);
            if (partner) {
                partner.sharedMovies.push({
                    isShared: isShared || false,
                    note,
                    movie,
                    createdBy: "partner"
                });
                yield partner.save();
            }
        }
        res.status(200).json({
            message: "Sorular güncellendi",
            status: "success",
            statusCode: 200,
            data: user,
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.updateSharedUserMovieController = updateSharedUserMovieController;
exports.default = exports.updateSharedUserMovieController;
