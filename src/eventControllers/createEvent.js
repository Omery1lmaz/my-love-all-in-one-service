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
const event_1 = require("../Models/event");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../Models/user");
const subscription_1 = require("../Models/subscription");
const createEventController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createEventController");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("authHeader not found");
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("token not found");
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const { title, description, eventType, customEventType, startDate, endDate, startTime, endTime, isAllDay, isRecurring, recurrence, location, mood, surpriseLevel, giftIdeas, photos, notes, budget, weatherDependent, weatherPreferences, isPrivate, memories, } = req.body;
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user) {
            console.log("user not found");
            res.status(400).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        // Ensure user has a subscription (create default if not exists)
        console.log(`Ensuring subscription exists for event creation - user: ${decodedToken.id}`);
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`Subscription verified/created for event creation - user: ${decodedToken.id}`, {
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
            console.error(`Error with subscription for event creation - user ${decodedToken.id}:`, error);
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can create more events (basic check)
        const existingEvents = yield event_1.Event.countDocuments({ userId: decodedToken.id });
        console.log(`Event count check for user: ${decodedToken.id}`, {
            existingEvents,
            planType: userSubscription.planType
        });
        // Basic event limit check (can be enhanced based on plan)
        const maxEvents = userSubscription.planType === 'free' ? 10 :
            userSubscription.planType === 'premium' ? 100 : 500;
        if (existingEvents >= maxEvents) {
            console.error(`Event limit exceeded for user: ${decodedToken.id}`, {
                existingEvents,
                maxEvents,
                planType: userSubscription.planType
            });
            res.status(400).json({
                message: `Etkinlik limiti aşıldı. Mevcut planınızla ${maxEvents} etkinlik oluşturabilirsiniz.`
            });
            return;
        }
        console.log(`Event creation allowed for user: ${decodedToken.id}`, {
            existingEvents,
            maxEvents,
            planType: userSubscription.planType
        });
        const event = new event_1.Event({
            userId: decodedToken.id,
            partnerId: user.partnerId || null,
            title,
            description,
            eventType,
            customEventType,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            startTime,
            endTime,
            isAllDay,
            isRecurring,
            recurrence,
            location,
            mood,
            surpriseLevel,
            giftIdeas,
            // photos,
            notes,
            budget,
            weatherDependent,
            weatherPreferences,
            isPrivate: isPrivate || false,
            memories,
        });
        console.log(`Saving event for user: ${decodedToken.id}`);
        yield event.save();
        console.log(`Event created successfully for user: ${decodedToken.id}`, {
            eventId: event._id,
            eventTitle: event.title,
            planType: userSubscription.planType,
            remainingEvents: maxEvents - (existingEvents + 1)
        });
        res.status(201).json({
            message: "Event başarıyla oluşturuldu",
            status: "success",
            statusCode: 201,
            data: event,
            subscriptionInfo: {
                planType: userSubscription.planType,
                remainingEvents: maxEvents - (existingEvents + 1),
                maxEvents: maxEvents
            }
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Event oluşturulamadı" });
    }
});
exports.default = createEventController;
