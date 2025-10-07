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
const mongoose_1 = __importDefault(require("mongoose"));
const getJournalDetailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { id } = req.params;
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
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        // Günlüğü bul ve kullanıcı veya partner kontrolü yap
        const journal = yield dailyJournal_1.DailyJournal.findOne({
            _id: new mongoose_1.default.Types.ObjectId(id),
            $or: [
                { user: user._id }, // Kullanıcının kendi günlüğü
                {
                    user: user.partnerId, // Partner'ın günlüğü
                    isPrivate: false, // Ama private olmayan
                },
            ],
        }).populate("photos", "url");
        if (!journal) {
            res.status(404).json({ message: "Günlük bulunamadı" });
            return;
        }
        res.status(200).json({
            message: "Günlük detayı başarıyla getirildi",
            status: "success",
            statusCode: 200,
            data: journal,
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Günlük detayı getirilemedi" });
    }
});
exports.default = getJournalDetailController;
