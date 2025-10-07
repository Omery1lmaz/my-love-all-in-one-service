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
exports.createTimelineController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const timeline_1 = require("../Models/timeline");
const mongoose_1 = __importDefault(require("mongoose"));
const subscription_1 = require("../Models/subscription");
const createTimelineController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        console.log(decoded.id, "decoded");
        const users = yield user_1.User.find();
        const user = yield user_1.User.findById(decoded.id);
        console.log("users", users);
        if (!user) {
            console.log("user not found");
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Ensure user has a subscription (create default if not exists)
        console.log(`Ensuring subscription exists for timeline creation - user: ${decoded.id}`);
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decoded.id));
            console.log(`Subscription verified/created for timeline creation - user: ${decoded.id}`, {
                subscriptionId: userSubscription._id,
                planType: userSubscription.planType,
                isActive: userSubscription.isActive
            });
            // Double check that subscription is active
            if (!userSubscription.isActive) {
                console.warn(`Subscription found but inactive for user: ${decoded.id}, activating...`);
                userSubscription.isActive = true;
                yield userSubscription.save();
                console.log(`Subscription activated for user: ${decoded.id}`);
            }
        }
        catch (error) {
            console.error(`Error with subscription for timeline creation - user ${decoded.id}:`, error);
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can create more timeline events (basic check)
        const existingTimelines = yield timeline_1.Timeline.countDocuments({ userId: decoded.id });
        console.log(`Timeline count check for user: ${decoded.id}`, {
            existingTimelines,
            planType: userSubscription.planType
        });
        // Basic timeline limit check (can be enhanced based on plan)
        const maxTimelines = userSubscription.planType === 'free' ? 20 :
            userSubscription.planType === 'premium' ? 100 : 500;
        if (existingTimelines >= maxTimelines) {
            console.error(`Timeline limit exceeded for user: ${decoded.id}`, {
                existingTimelines,
                maxTimelines,
                planType: userSubscription.planType
            });
            res.status(400).json({
                message: `Timeline limiti aşıldı. Mevcut planınızla ${maxTimelines} timeline oluşturabilirsiniz.`
            });
            return;
        }
        console.log(`Timeline creation allowed for user: ${decoded.id}`, {
            existingTimelines,
            maxTimelines,
            planType: userSubscription.planType
        });
        const { title, description, date, type, isPrivate, icon } = req.body;
        const timelineEvent = timeline_1.Timeline.build({
            userId: user.id,
            partnerId: user.partnerId,
            title,
            description,
            date: new Date(date),
            type,
            photos: [],
            coverPhotoId: undefined,
            isPrivate,
            icon
        });
        console.log(`Saving timeline event for user: ${decoded.id}`);
        yield timelineEvent.save();
        console.log(`Timeline event created successfully for user: ${decoded.id}`, {
            timelineId: timelineEvent._id,
            timelineTitle: timelineEvent.title,
            planType: userSubscription.planType,
            remainingTimelines: maxTimelines - (existingTimelines + 1)
        });
        res.status(201).json({
            message: "Timeline event created successfully",
            status: "success",
            statusCode: 201,
            data: timelineEvent,
            subscriptionInfo: {
                planType: userSubscription.planType,
                remainingTimelines: maxTimelines - (existingTimelines + 1),
                maxTimelines: maxTimelines
            }
        });
    }
    catch (error) {
        console.error("Error creating timeline event:", error);
        res.status(500).json({ message: "Error creating timeline event" });
    }
});
exports.createTimelineController = createTimelineController;
exports.default = exports.createTimelineController;
