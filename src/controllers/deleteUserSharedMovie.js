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
exports.deleteSharedUserMovieController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const mongoose_1 = __importDefault(require("mongoose"));
const deleteSharedUserMovieController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("test deneme");
    const authHeader = req.headers.authorization;
    const { id } = req.params;
    console.log("id", id);
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
        const movieDetail = user.sharedMovies.find((movie) => movie._id == id);
        if (!movieDetail) {
            next(new common_1.BadRequestError("The movie doesn't exist"));
            return;
        }
        // Filmi sharedMovies listesinden çıkar
        user.set('sharedMovies', user.sharedMovies.filter((movie) => movie._id != id));
        yield user.save();
        // Eğer isShared true ise partnerin sharedMovies'ine de ekle
        res.status(200).json({
            message: "Film silindi",
            status: "success",
            statusCode: 200,
            data: movieDetail,
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.deleteSharedUserMovieController = deleteSharedUserMovieController;
exports.default = exports.deleteSharedUserMovieController;
