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
const dailyJournal_1 = require("../Models/dailyJournal");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../Models/user");
const subscription_1 = require("../Models/subscription");
const createJournalController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createJournalController");
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
        const { title, content, mood, isPrivate, tags, weather } = req.body;
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user) {
            console.log("user not found create journal");
            res.status(400).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        // Ensure user has a subscription (create default if not exists)
        console.log(`Ensuring subscription exists for journal creation - user: ${decodedToken.id}`);
        let userSubscription;
        try {
            userSubscription = yield subscription_1.Subscription.getDefaultSubscription(new mongoose_1.default.Types.ObjectId(decodedToken.id));
            console.log(`Subscription verified/created for journal creation - user: ${decodedToken.id}`, {
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
            console.error(`Error with subscription for journal creation - user ${decodedToken.id}:`, error);
            res.status(400).json({ message: "Subscription doğrulanamadı" });
            return;
        }
        // Check if user can create more journals (basic check)
        const existingJournals = yield dailyJournal_1.DailyJournal.countDocuments({ user: decodedToken.id });
        console.log(`Journal count check for user: ${decodedToken.id}`, {
            existingJournals,
            planType: userSubscription.planType
        });
        // Basic journal limit check (can be enhanced based on plan)
        const maxJournals = userSubscription.planType === 'free' ? 30 :
            userSubscription.planType === 'premium' ? 365 : 1000;
        if (existingJournals >= maxJournals) {
            console.error(`Journal limit exceeded for user: ${decodedToken.id}`, {
                existingJournals,
                maxJournals,
                planType: userSubscription.planType
            });
            res.status(400).json({
                message: `Günlük limiti aşıldı. Mevcut planınızla ${maxJournals} günlük oluşturabilirsiniz.`
            });
            return;
        }
        console.log(`Journal creation allowed for user: ${decodedToken.id}`, {
            existingJournals,
            maxJournals,
            planType: userSubscription.planType
        });
        const journal = new dailyJournal_1.DailyJournal({
            user: decodedToken.id,
            date: new Date(),
            title,
            content,
            mood,
            partner: user.partnerId,
            isPrivate,
            tags,
            weather,
        });
        console.log(`Saving journal for user: ${decodedToken.id}`);
        yield journal.save();
        console.log(`Journal created successfully for user: ${decodedToken.id}`, {
            journalId: journal._id,
            journalTitle: journal.title,
            planType: userSubscription.planType,
            remainingJournals: maxJournals - (existingJournals + 1)
        });
        res.status(201).json({
            message: "Günlük başarıyla oluşturuldu",
            status: "success",
            statusCode: 201,
            data: journal,
            subscriptionInfo: {
                planType: userSubscription.planType,
                remainingJournals: maxJournals - (existingJournals + 1),
                maxJournals: maxJournals
            }
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Günlük oluşturulamadı" });
    }
});
exports.default = createJournalController;
