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
exports.uploadUserSharedProfilePhotoController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@heaven-nsoft/common");
const sharp_1 = __importDefault(require("sharp"));
const userPhoto_1 = require("../Models/userPhoto");
const upload_1 = require("../utils/upload");
const user_1 = require("../Models/user");
const uploadUserSharedProfilePhotoController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                return next(new common_1.NotAuthorizedError());
            const token = authHeader.split(" ")[1];
            let decodedToken;
            try {
                decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            }
            catch (_a) {
                next(new common_1.NotAuthorizedError());
                return;
            }
            if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id) || !req.file) {
                next(new common_1.BadRequestError("File upload failed"));
                return;
            }
            const file = req.file;
            // S3 için isim üret
            const fileName = `${Date.now()}-${file.originalname}`;
            const thumbnailName = `thumb-${fileName}`;
            // Orijinal ve Thumbnail oluştur
            const [originalUrl, thumbnailUrl] = yield Promise.all([
                (0, upload_1.uploadToS3)(file.buffer, fileName, file.mimetype),
                (0, sharp_1.default)(file.buffer).resize({ width: 300 }).toBuffer().then((thumbBuffer) => (0, upload_1.uploadToS3)(thumbBuffer, thumbnailName, file.mimetype)),
            ]);
            console.log(originalUrl, thumbnailUrl, "originalUrl, thumbnailUrl");
            const newPhoto = new userPhoto_1.UserPhoto({
                user: decodedToken.id,
                url: originalUrl,
                thumbnailUrl,
            });
            const savedPhoto = yield newPhoto.save();
            const user = yield user_1.User.findById(decodedToken.id);
            if (!user) {
                next(new common_1.NotFoundError());
                return;
            }
            user.sharedProfilePic = newPhoto._id;
            yield user.save();
            if (user.partnerId) {
                const partner = yield user_1.User.findById(user.partnerId);
                if (partner) {
                    partner.sharedProfilePic = newPhoto._id;
                    yield partner.save();
                }
            }
            res.status(201).json({
                message: "User Photo created successfully",
                imageUrl: originalUrl,
                thumbnailUrl,
                photo: savedPhoto,
            });
        }
        catch (error) {
            console.error("Error creating photo:", error);
            next(new common_1.BadRequestError("Internal server error"));
            return;
        }
    }
    catch (error) {
        console.error("Error creating photo:", error);
        next(new common_1.BadRequestError("Internal server error"));
        return;
    }
});
exports.uploadUserSharedProfilePhotoController = uploadUserSharedProfilePhotoController;
exports.default = exports.uploadUserSharedProfilePhotoController;
