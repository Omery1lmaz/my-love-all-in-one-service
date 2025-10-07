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
exports.updateUserPhotoMoment = void 0;
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const photo_1 = require("../Models/photo");
const updateUserPhotoMoment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const { moment = "" } = req.body;
        console.log(moment, "moment");
        console.log("updateUserPhotoMoment authHeader", authHeader);
        if (!authHeader) {
            console.log("updateUserPhotoMoment authHeader");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            console.log("updateUserPhotoMoment token");
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("updateUserPhotoMoment err", err);
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("updateUserPhotoMoment decodedToken?.id");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const photo = yield photo_1.Photo.findOne({
            _id: req.params.photoId,
            $or: [
                { user: decodedToken.id },
                { user: decodedToken.partnerId }
            ]
        });
        console.log("updateUserPhotoMoment photo", photo);
        if (!photo) {
            console.log("updateUserPhotoMoment photo", photo);
            next(new common_1.NotFoundError());
            return;
        }
        // Initialize moment object if it doesn't exist
        if (!photo.moment) {
            photo.moment = { me: { description: "" }, partner: { description: "" } };
        }
        if (!photo.moment.me) {
            photo.moment.me = { description: "" };
        }
        if (!photo.moment.partner) {
            photo.moment.partner = { description: "" };
        }
        if (photo.user.toString() === decodedToken.id) {
            photo.moment.me.description = moment;
        }
        else if (photo.user.toString() === decodedToken.partnerId) {
            photo.moment.partner.description = moment;
        }
        else {
            next(new common_1.NotFoundError());
            return;
        }
        yield photo.save();
        res.status(200).json(photo);
    }
    catch (error) {
        console.error("Error fetching photo:", error);
        res.status(500).json({ message: "Error fetching photo" });
    }
});
exports.updateUserPhotoMoment = updateUserPhotoMoment;
exports.default = exports.updateUserPhotoMoment;
