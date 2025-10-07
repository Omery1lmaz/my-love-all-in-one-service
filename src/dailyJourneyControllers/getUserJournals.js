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
const getUserJournalsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    console.log("get user journals");
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
        const { page = 1, limit = 10, sort = "desc" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        console.log(decodedToken.id, "decoded token id");
        const journals = yield dailyJournal_1.DailyJournal.find({ user: decodedToken.id })
            .sort({ date: sort === "desc" ? -1 : 1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("photos", "url")
            .exec();
        const total = yield dailyJournal_1.DailyJournal.countDocuments({ user: decodedToken.id });
        res.status(200).json({
            message: "Günlükler başarıyla getirildi",
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
        res.status(400).json({ message: "Günlükler getirilemedi" });
    }
});
exports.default = getUserJournalsController;
