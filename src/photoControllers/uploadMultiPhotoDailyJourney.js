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
const dailyJournal_1 = require("../Models/dailyJournal");
const uploadMultiPhotoDailyJourneyController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("uploadMultiPhotoTimelineController");
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
        const { description = "", tags = [], musicUrl = "", note = "", location, coverPhotoFileName, dailyJourneyId, } = req.body;
        console.log("Request body:", req.body);
        console.log("dailyJourneyId:", dailyJourneyId, "type:", typeof dailyJourneyId);
        // Validate dailyJourneyId
        if (!dailyJourneyId) {
            next(new common_1.BadRequestError("dailyJourneyId is required"));
            return;
        }
        // Validate if dailyJourneyId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(dailyJourneyId)) {
            next(new common_1.BadRequestError("Invalid dailyJourneyId format"));
            return;
        }
        // Ensure tags is an array
        const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []);
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
                try {
                    locationData = typeof location === 'string' ? JSON.parse(location) : location;
                }
                catch (error) {
                    console.error("Error parsing location:", error);
                    locationData = null;
                }
            }
            const newPhoto = new photo_1.Photo({
                user: decodedToken.id,
                dailyJournal: dailyJourneyId,
                url: originalUrl,
                thumbnailUrl,
                tags: tagsArray,
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
        const dailyJourney = yield dailyJournal_1.DailyJournal.findById(dailyJourneyId);
        if (!dailyJourney) {
            next(new common_1.NotFoundError());
            return;
        }
        dailyJourney.photos = uploadedPhotos.map((photo) => photo._id);
        yield dailyJourney.save();
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
exports.default = uploadMultiPhotoDailyJourneyController;
