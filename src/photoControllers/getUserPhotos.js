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
exports.getUserPhotosController = void 0;
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const photo_1 = require("../Models/photo");
const getUserPhotosController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getUserPhotosController");
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("getUserPhotosController authHeader");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            console.log("getUserPhotosController token");
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("getUserPhotosController err");
            next(new common_1.NotAuthorizedError());
            return;
        }
        console.log("getUserPhotosController decodedToken", decodedToken.id, decodedToken.partnerId);
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("getUserPhotosController decodedToken?.id");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const photos = yield photo_1.Photo.find({
            $or: [
                { user: decodedToken.id },
                ...(decodedToken.partnerId ? [{
                        user: decodedToken.partnerId,
                        isPrivate: false
                    }] : [])
            ]
        });
        res.status(200).json(photos);
    }
    catch (error) {
        console.error("Error fetching user photos:", error);
        res.status(500).json({ message: "Error fetching photos" });
    }
});
exports.getUserPhotosController = getUserPhotosController;
exports.default = exports.getUserPhotosController;
