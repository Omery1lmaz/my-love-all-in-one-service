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
const getUpcomingEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getUpcomingEventsController");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("authHeader not found");
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    console.log(token, "token");
    if (!token) {
        console.log("token not found");
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        console.log(process.env.SECRET_KEY, "process env secret key");
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        // Query parameters
        const days = parseInt(req.query.days) || 1200; // Varsayılan 30 gün
        const limit = parseInt(req.query.limit) || 10; // Varsayılan 10 event
        const now = new Date(-1);
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);
        // Kullanıcının eventlerini al
        const userEvents = yield event_1.Event.find({
            $or: [{ userId: decodedToken.id }, { partnerId: decodedToken.id }],
        })
            .populate("photos")
            .populate("coverPhotoId");
        const upcomingEvents = [];
        for (const event of userEvents) {
            // Tekrarlı olmayan eventler için basit kontrol
            if (!event.isRecurring) {
                if (event.startDate >= now && event.startDate <= futureDate) {
                    upcomingEvents.push(Object.assign(Object.assign({}, event.toObject()), { nextOccurrence: event.startDate, isRecurring: false }));
                }
            }
            else {
                // Tekrarlı eventler için gelecek oluşumları hesapla
                const nextOccurrences = calculateNextOccurrences(event.startDate, event.recurrence, now, futureDate);
                for (const occurrence of nextOccurrences) {
                    upcomingEvents.push(Object.assign(Object.assign({}, event.toObject()), { nextOccurrence: occurrence, isRecurring: true, originalStartDate: event.startDate }));
                }
            }
        }
        // Tarihe göre sırala ve limit uygula
        upcomingEvents.sort((a, b) => a.nextOccurrence - b.nextOccurrence);
        const limitedEvents = upcomingEvents.slice(0, limit);
        res.status(200).json({
            message: "Yaklaşan eventler başarıyla alındı",
            status: "success",
            statusCode: 200,
            data: limitedEvents,
            total: upcomingEvents.length,
            days: days
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Yaklaşan eventler alınamadı" });
    }
});
// Tekrarlı eventler için gelecek oluşumları hesaplayan yardımcı fonksiyon
function calculateNextOccurrences(startDate, recurrence, fromDate, toDate) {
    const occurrences = [];
    const interval = recurrence.interval || 1;
    let currentDate = new Date(startDate);
    // Eğer başlangıç tarihi geçmişte ise, gelecek oluşumları hesapla
    while (currentDate < fromDate) {
        switch (recurrence.frequency) {
            case "daily":
                currentDate.setDate(currentDate.getDate() + interval);
                break;
            case "weekly":
                currentDate.setDate(currentDate.getDate() + (7 * interval));
                break;
            case "monthly":
                currentDate.setMonth(currentDate.getMonth() + interval);
                break;
            case "yearly":
                currentDate.setFullYear(currentDate.getFullYear() + interval);
                break;
        }
    }
    // Gelecek oluşumları topla
    while (currentDate <= toDate) {
        if (!recurrence.endDate || currentDate <= recurrence.endDate) {
            occurrences.push(new Date(currentDate));
        }
        switch (recurrence.frequency) {
            case "daily":
                currentDate.setDate(currentDate.getDate() + interval);
                break;
            case "weekly":
                currentDate.setDate(currentDate.getDate() + (7 * interval));
                break;
            case "monthly":
                currentDate.setMonth(currentDate.getMonth() + interval);
                break;
            case "yearly":
                currentDate.setFullYear(currentDate.getFullYear() + interval);
                break;
        }
    }
    return occurrences;
}
exports.default = getUpcomingEventsController;
