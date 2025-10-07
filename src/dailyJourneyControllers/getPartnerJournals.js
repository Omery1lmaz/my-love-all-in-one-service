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
const user_1 = require("../Models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getPartnerJournalsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user || !user.partnerId) {
            console.log("user not found");
            res.status(400).json({ message: "Partner bulunamadı" });
            return;
        }
        const { page = 1, limit = 10, sort = "desc" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const journals = yield dailyJournal_1.DailyJournal.find({
            user: user.partnerId,
            isPrivate: false, // Sadece public günlükleri getir
        })
            .sort({ date: sort === "desc" ? -1 : 1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("photos", "url")
            .exec();
        const total = yield dailyJournal_1.DailyJournal.countDocuments({
            user: user.partnerId,
            isPrivate: false,
        });
        res.status(200).json({
            message: "Partner günlükleri başarıyla getirildi",
            status: "success",
            statusCode: 200,
            data: {
                journals,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Partner günlükleri getirilemedi" });
    }
});
exports.default = getPartnerJournalsController;
