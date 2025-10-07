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
exports.getTodaySongController = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getTodaySongController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Validate input
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("failed autheader");
            res.status(401).json({ message: "Lütfen giriş yapın" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log("failed token ");
            res.status(400).json({ message: "Token bulunamadı" });
            return;
        }
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            const user = yield user_1.User.findById(decodedToken.id);
            if (!user) {
                console.log("not authorized");
                next(new common_1.NotAuthorizedError());
                return;
            }
            // Check if a song is already set for today
            const today = new Date().toISOString().split("T")[0]; // Bugünün tarihini alın (YYYY-MM-DD formatında)
            // Bugünün şarkısını bul
            const todaySong = (_a = user.dailySong) === null || _a === void 0 ? void 0 : _a.find((song) => {
                const songDate = new Date(song.date).toISOString().split("T")[0];
                return songDate === today; // Tarih bugüne eşitse
            });
            if (!todaySong) {
                next(new common_1.BadRequestError("Not found today song"));
                return;
            }
            res.status(200).send({
                message: "Today's song has been set.",
                data: todaySong || null,
            });
        }
        catch (error) {
            console.log(error, "error test deneme");
            next(new common_1.BadRequestError("Something went wrong"));
            return;
        }
    }
    catch (err) {
        console.error(err);
        next(new common_1.BadRequestError("An unexpected error occurred."));
    }
});
exports.getTodaySongController = getTodaySongController;
