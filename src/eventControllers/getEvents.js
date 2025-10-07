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
const getEventsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getEventsController");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("authHeader not found");
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    console.log(token);
    if (!token) {
        console.log("token not found");
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        console.log(decodedToken);
        const events = yield event_1.Event.find({
            $or: [{ userId: decodedToken.id }, { partnerId: decodedToken.id }],
        })
            .populate("photos")
            .populate("coverPhotoId");
        console.log("events", events);
        if (!events) {
            console.log("events not found");
            res.status(400).json({ message: "Eventler bulunamadı" });
            return;
        }
        res.status(201).json({
            message: "Eventler başarıyla alındı",
            status: "success",
            statusCode: 201,
            data: events,
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Eventler alınamadı" });
    }
});
exports.default = getEventsController;
