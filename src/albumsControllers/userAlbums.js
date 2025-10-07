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
exports.userAlbums = void 0;
const album_1 = require("../Models/album");
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const subscription_1 = require("../Models/subscription");
const userAlbums = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("test");
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next(new my_love_common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("err", err);
            next(new my_love_common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("no id");
            next(new my_love_common_1.NotAuthorizedError());
            return;
        }
        // Ensure user has a subscription (create default if not exists)
        console.log(`Ensuring subscription exists for album listing - user: ${decodedToken.id}`);
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`Subscription verified/created for album listing - user: ${decodedToken.id}`, {
                subscriptionId: userSubscription._id,
                planType: userSubscription.planType,
                isActive: userSubscription.isActive
            });
            // Double check that subscription is active
            if (!userSubscription.isActive) {
                console.warn(`Subscription found but inactive for user: ${decodedToken.id}, activating...`);
                userSubscription.isActive = true;
                yield userSubscription.save();
                console.log(`Subscription activated for user: ${decodedToken.id}`);
            }
        }
        catch (error) {
            console.error(`Error with subscription for album listing - user ${decodedToken.id}:`, error);
            return next(new my_love_common_1.BadRequestError("Failed to create or verify subscription"));
        }
        console.log(`Fetching albums for user: ${decodedToken.id}`);
        const albums = yield album_1.Album.find({
            $or: [
                { user: decodedToken.id },
                ...(decodedToken.partnerId ? [{
                        user: decodedToken.partnerId,
                        isPrivate: false
                    }] : [])
            ]
        }).populate("photos coverPhoto");
        // Get album count for subscription info
        const albumCount = yield album_1.Album.countDocuments({ user: decodedToken.id });
        const maxAlbums = userSubscription.planType === 'free' ? 5 :
            userSubscription.planType === 'premium' ? 50 : 200;
        console.log(`Albums retrieved successfully for user: ${decodedToken.id}`, {
            albumCount: albums.length,
            userAlbumCount: albumCount,
            planType: userSubscription.planType,
            maxAlbums: maxAlbums
        });
        res.status(201).json({
            message: "Albums retrieved successfully",
            data: albums,
            subscriptionInfo: {
                planType: userSubscription.planType,
                currentAlbums: albumCount,
                maxAlbums: maxAlbums,
                remainingAlbums: maxAlbums - albumCount
            }
        });
    }
    catch (error) {
        console.error("Error creating album:", error);
        next(new my_love_common_1.BadRequestError(error.message));
    }
});
exports.userAlbums = userAlbums;
