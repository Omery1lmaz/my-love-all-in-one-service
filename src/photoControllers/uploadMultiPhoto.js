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
exports.uploadMultiPhotoController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@heaven-nsoft/common");
const sharp_1 = __importDefault(require("sharp"));
const photo_1 = require("../Models/photo");
const upload_1 = require("../utils/upload");
const album_1 = require("../Models/album");
const uploadMultiPhotoController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!req.files || !Array.isArray(req.files)) {
            next(new common_1.BadRequestError("File upload failed"));
            return;
        }
        const { description = "", tags = [], musicUrl = "", note = "", location, coverPhotoFileName, albumId, title = "", musicDetails, photoDate = new Date(), isPrivate = false, } = req.body;
        const uploadedPhotos = [];
        let coverPhotoId = null;
        for (const file of req.files) {
            const fileName = `${Date.now()}-${file.originalname}`;
            const thumbnailName = `thumb-${fileName}`;
            // Upload original and thumbnail to S3
            const [originalUrl, thumbnailUrl] = yield Promise.all([
                (0, upload_1.uploadToS3)(file.buffer, fileName, file.mimetype),
                (0, sharp_1.default)(file.buffer).resize({ width: 300 }).toBuffer().then((thumbBuffer) => (0, upload_1.uploadToS3)(thumbBuffer, thumbnailName, file.mimetype)),
            ]);
            let locationData = null;
            if (location) {
                locationData = JSON.parse(location);
            }
            console.log("tags", tags);
            let parsedTags = [];
            try {
                parsedTags = tags && typeof tags === "string" ? JSON.parse(tags) : [];
            }
            catch (error) {
                console.log("error", error);
            }
            const parsedDate = photoDate && !isNaN(new Date(photoDate).getTime())
                ? new Date(photoDate)
                : new Date();
            const parsedIsPrivate = typeof isPrivate === "string" ? JSON.parse(isPrivate) : isPrivate;
            const parsedMusicDetails = musicDetails ? JSON.parse(musicDetails) : null;
            const newPhoto = new photo_1.Photo({
                user: decodedToken.id,
                album: albumId,
                url: originalUrl,
                thumbnailUrl,
                moment: {
                    me: {
                        description,
                    },
                    partner: {
                        description: "",
                    },
                },
                photoDate: parsedDate,
                tags: parsedTags,
                musicUrl,
                title,
                note,
                location: locationData,
                musicDetails: parsedMusicDetails,
                isPrivate: parsedIsPrivate,
            });
            const savedPhoto = yield newPhoto.save();
            uploadedPhotos.push(savedPhoto);
            if (coverPhotoFileName === file.originalname) {
                coverPhotoId = savedPhoto._id;
            }
        }
        const album = yield album_1.Album.findById(albumId);
        if (!album) {
            next(new common_1.NotFoundError());
            return;
        }
        album.photos = uploadedPhotos.map((photo) => photo._id);
        yield album.save();
        res.status(201).json({
            message: "Photos uploaded successfully",
            uploadedPhotos: uploadedPhotos || [],
            coverPhotoId: coverPhotoId || null,
        });
    }
    catch (error) {
        console.error("Error creating photo:", error);
        next(new common_1.BadRequestError("Internal server error"));
        return;
    }
});
exports.uploadMultiPhotoController = uploadMultiPhotoController;
exports.default = exports.uploadMultiPhotoController;
