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
exports.updatePasswordController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const updatePasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("updatePasswordController");
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("Lütfen giriş yapınız.");
            res.status(401).json({ message: "Lütfen giriş yapınız." });
            return;
        }
        const token = authHeader.split(" ")[1];
        console.log("token", token);
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const { oldPassword, newPassword, newPasswordConfirm } = req.body;
        if (!newPassword || !newPasswordConfirm || !oldPassword) {
            console.log("Lütfen tüm alanları doldurunuz.");
            res.status(400).json({ message: "Lütfen tüm alanları doldurunuz." });
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            console.log("Yeni şifreler eşleşmiyor.");
            res.status(400).json({ message: "Yeni şifreler eşleşmiyor." });
            return;
        }
        const user = yield user_1.User.findOne({
            _id: decodedToken.id,
            provider: "email",
        });
        if (!user || !user.isActive) {
            console.log("Hesabınızı aktif etmelisiniz.");
            res.status(403).json({ message: "Hesabınızı aktif etmelisiniz." });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password || "");
        if (!isMatch) {
            console.log("Eski şifreniz yanlış.");
            res.status(400).json({ message: "Eski şifreniz yanlış." });
        }
        if (oldPassword === newPassword) {
            console.log("Eski şifreniz yeni şifreniz ile aynı olamaz.");
            res
                .status(400)
                .json({ message: "Eski şifreniz yeni şifreniz ile aynı olamaz." });
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: "Şifreniz başarıyla güncellendi." });
    }
    catch (error) {
        console.error("Şifre güncelleme hatası:", error);
        console.error("Timestamp:", new Date().toISOString());
        console.error("Error Type:", ((_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name) || "Unknown");
        console.error("Request Body:", req.body);
        console.error("Request Headers:", req.headers);
        console.error("Request Cookies:", req.cookies);
        console.error("================================");
        res
            .status(500)
            .json({ message: "Bir hata oluştu, lütfen tekrar deneyiniz." });
    }
});
exports.updatePasswordController = updatePasswordController;
exports.default = exports.updatePasswordController;
