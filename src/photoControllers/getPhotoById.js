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
exports.getPhotoByIdController = void 0;
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const photo_1 = require("../Models/photo");
const getPhotoByIdController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        console.log("getPhotoByIdController authHeader", authHeader);
        if (!authHeader) {
            console.log("getPhotoByIdController authHeader");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            console.log("getPhotoByIdController token");
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("getPhotoByIdController err", err);
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("getPhotoByIdController decodedToken?.id");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const photo = yield photo_1.Photo.findOne({
            _id: req.params.photoId,
            user: decodedToken.id,
        });
        console.log("getPhotoByIdController photo", photo);
        if (!photo) {
            next(new common_1.NotFoundError());
            return;
        }
        res.status(200).json(photo);
    }
    catch (error) {
        console.error("Error fetching photo:", error);
        res.status(500).json({ message: "Error fetching photo" });
    }
});
exports.getPhotoByIdController = getPhotoByIdController;
exports.default = exports.getPhotoByIdController;
