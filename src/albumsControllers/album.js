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
exports.createAlbum = void 0;
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const album_1 = require("../Models/album");
const subscription_1 = require("../Models/subscription");
// import { AlbumCreatedEventPublisher } from "../events/publishers/album-created-publisher";
const createAlbum = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        const { name, description, event, isPrivate, categories, location, allowCollaboration, startDate, endDate, musicDetails, } = req.body;
        if (!name) {
            console.log("no name");
            throw new my_love_common_1.BadRequestError("Album name is required");
        }
        // Ensure user has a subscription (create default if not exists)
        console.log(`Ensuring subscription exists for album creation - user: ${decodedToken.id}`);
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`Subscription verified/created for album creation - user: ${decodedToken.id}`, {
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
            console.error(`Error with subscription for album creation - user ${decodedToken.id}:`, error);
            return next(new my_love_common_1.BadRequestError("Failed to create or verify subscription"));
        }
        // Check if user can create more albums (basic check)
        const existingAlbums = yield album_1.Album.countDocuments({ user: decodedToken.id });
        console.log(`Album count check for user: ${decodedToken.id}`, {
            existingAlbums,
            planType: userSubscription.planType
        });
        // Basic album limit check (can be enhanced based on plan)
        const maxAlbums = userSubscription.planType === 'free' ? 5 :
            userSubscription.planType === 'premium' ? 50 : 200;
        if (existingAlbums >= maxAlbums) {
            console.error(`Album limit exceeded for user: ${decodedToken.id}`, {
                existingAlbums,
                maxAlbums,
                planType: userSubscription.planType
            });
            return next(new my_love_common_1.BadRequestError(`Album limit exceeded. You can create up to ${maxAlbums} albums with your current plan.`));
        }
        console.log(`Album creation allowed for user: ${decodedToken.id}`, {
            existingAlbums,
            maxAlbums,
            planType: userSubscription.planType
        });
        // Create new album with direct values
        const album = new album_1.Album({
            user: decodedToken.id,
            name,
            description,
            event,
            isPrivate: isPrivate === "true",
            categories: Array.isArray(categories) ? categories : [],
            location,
            musicDetails: musicDetails || null,
            allowCollaboration: allowCollaboration === "true",
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            photos: [],
            sizeInMB: 0,
            collaborators: [],
        });
        console.log(`Saving album for user: ${decodedToken.id}`);
        yield album.save();
        console.log(`Album created successfully for user: ${decodedToken.id}`, {
            albumId: album._id,
            albumName: album.name,
            planType: userSubscription.planType,
            remainingAlbums: maxAlbums - (existingAlbums + 1)
        });
        // await new AlbumCreatedEventPublisher(natsWrapper.client).publish({
        //   id: (album._id as any).toString(),
        //   version: album.__v,
        //   allowCollaboration: album.allowCollaboration,
        //   categories: album.categories,
        //   collaborators: album.collaborators,
        //   coverPhoto: album.coverPhoto,
        //   description: album.description,
        //   event: album.event,
        //   isPrivate: album.isPrivate,
        //   location: album.location,
        //   musicDetails: album.musicDetails,
        //   name: album.name,
        //   sizeInMB: album.sizeInMB,
        //   user: album.user,
        // });
        res.status(201).json({
            message: "Album created successfully",
            data: album,
            subscriptionInfo: {
                planType: userSubscription.planType,
                remainingAlbums: maxAlbums - (existingAlbums + 1),
                maxAlbums: maxAlbums
            }
        });
    }
    catch (error) {
        console.error("Error creating album:", error);
        next(new my_love_common_1.BadRequestError(error.message));
    }
});
exports.createAlbum = createAlbum;
