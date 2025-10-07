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
const common_1 = require("@heaven-nsoft/common");
const mongoose_1 = __importDefault(require("mongoose"));
const photo_1 = require("../Models/photo");
const sharp_1 = __importDefault(require("sharp"));
const upload_1 = require("../utils/upload");
const event_1 = require("../Models/event");
const uploadMultiPhotoEventController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Return type is Promise<void>
    try {
        console.log("uploadMultiPhotoEventController");
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("NotAuthorizedError");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("NotAuthorizedError");
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("NotAuthorizedError");
            next(new common_1.NotAuthorizedError());
            return;
        }
        console.log("req.files", req.files);
        if (!req.files || !Array.isArray(req.files)) {
            console.log("BadRequestError");
            next(new common_1.BadRequestError("File upload failed"));
            return;
        }
        const { description = "", tags = [], musicUrl = "", note = "", location, coverPhotoFileName, eventId, } = req.body;
        console.log("coverPhotoFileName", coverPhotoFileName);
        const uploadedPhotos = [];
        let coverPhotoId = null;
        for (const file of req.files) {
            console.log("file", file);
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
            const newPhoto = new photo_1.Photo({
                user: new mongoose_1.default.Types.ObjectId(),
                event: eventId,
                url: originalUrl,
                thumbnailUrl,
                tags,
                musicUrl,
                note,
                location: locationData,
                isPrivate: false,
            });
            const savedPhoto = yield newPhoto.save();
            uploadedPhotos.push(savedPhoto);
            if (coverPhotoFileName === file.originalname) {
                console.log("coverPhotoFileName", coverPhotoFileName, file.originalname);
                coverPhotoId = savedPhoto._id;
            }
        }
        const existsEvent = yield event_1.Event.findById(eventId);
        if (!existsEvent) {
            console.log("Event not found");
            next(new common_1.NotFoundError());
            return;
        }
        existsEvent.photos = uploadedPhotos.map((photo) => photo._id);
        yield existsEvent.save();
        console.log("cover photo id", coverPhotoId);
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
exports.default = uploadMultiPhotoEventController;
