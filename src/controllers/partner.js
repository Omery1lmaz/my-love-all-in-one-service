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
exports.updatePartnerInfo = void 0;
const user_1 = require("../Models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const updatePartnerInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { nickname } = req.body;
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
        const user = yield user_1.User.findById(decodedToken.id).populate("partnerId");
        if (!user) {
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        console.log(user.partnerId, "partner id test deneme");
        if (user.partnerId) {
            const existPartner = yield user_1.User.findById(user.partnerId._id);
            if (existPartner) {
                existPartner.nickname = nickname;
                yield existPartner.save();
            }
        }
        user.partnerNickname = nickname || user.partnerNickname;
        yield user.save();
        res.status(200).json({
            data: user.partnerNickname,
            success: "OK",
            statusCode: 201
        });
    }
    catch (error) {
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.updatePartnerInfo = updatePartnerInfo;
