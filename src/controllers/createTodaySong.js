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
exports.createTodaySongController = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const expoNotificationService_1 = require("../services/expoNotificationService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createTodaySongController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { images, name, artists, external_urls, spotifyTrackId, spotifyArtist, spotifyAlbum, 
        // song: song,
        message, } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: "Lütfen giriş yapın" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(400).json({ message: "Token bulunamadı" });
            return;
        }
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            const user = yield user_1.User.findById(decodedToken.id);
            if (!user) {
                next(new common_1.NotAuthorizedError());
                return;
            }
            // Check if a song is already set for today
            const today = new Date().toISOString().split("T")[0];
            const hasSongForToday = (_a = user.dailySong) === null || _a === void 0 ? void 0 : _a.find((song) => {
                var _a;
                const songDate = new Date(song.date).toISOString().split("T")[0];
                const songChoosen = ((_a = song.chosenBy) === null || _a === void 0 ? void 0 : _a.toString()) === user._id.toString();
                return songDate === today && songChoosen;
            });
            if (hasSongForToday) {
                next(new common_1.BadRequestError("You already have a song for today."));
                return;
            }
            // Add today's song
            const newSong = {
                addedAt: new Date(),
                date: new Date(Date.now()),
                external_urls: external_urls,
                id: spotifyTrackId,
                images: images,
                name: name,
                spotifyAlbum: spotifyAlbum,
                spotifyArtist: spotifyArtist,
                spotifyTrackId: spotifyTrackId,
                chosenBy: user._id,
                message: message || "",
            };
            // Push to dailySongHistory
            user.dailySong = user.dailySong || [];
            user.dailySong.push(newSong);
            if (user.partnerId) {
                const partner = yield user_1.User.findById(user.partnerId);
                if (partner) {
                    partner.dailySong = partner.dailySong || [];
                    partner.dailySong.push(newSong);
                    yield partner.save();
                    // Send push notification to partner
                    if (partner.expoPushToken) {
                        try {
                            const userName = user.nickname || user.name || 'Partner';
                            yield expoNotificationService_1.expoNotificationService.sendDailySongNotification(partner.expoPushToken, userName, name);
                            console.log('Push notification sent for daily song');
                        }
                        catch (notificationError) {
                            console.error('Error sending daily song notification:', notificationError);
                            // Don't fail the song creation if notification fails
                        }
                    }
                }
            }
            yield user.save();
            res
                .status(200)
                .send({ message: "Today's song has been set.", song: newSong });
        }
        catch (error) {
            next(new common_1.NotAuthorizedError());
            return;
        }
    }
    catch (err) {
        console.error(err);
        next(new common_1.BadRequestError("An unexpected error occurred."));
    }
});
exports.createTodaySongController = createTodaySongController;
