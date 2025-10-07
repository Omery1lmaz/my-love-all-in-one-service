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
exports.resetPasswordSendEmailController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const generateOTP_1 = require("../helpers/generateOTP");
const mailTransporter_1 = __importDefault(require("../utils/mailTransporter"));
const common_1 = require("@heaven-nsoft/common");
const resetPasswordSendEmailController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("test deneme reset password");
        const { email } = req.body;
        console.log("email", email);
        const user = yield user_1.User.findOne({ email: email });
        if (!user) {
            console.log("user yok");
            next(new common_1.BadRequestError("Kullanıcı bulunamadı veya hesabınız aktif değil."));
            return;
        }
        const otpToken = (0, generateOTP_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP 10 dakika geçerli
        const maxAge = 3 * 24 * 60 * 60; // 3 gün
        const jwtPayload = { id: user._id, password: user.password };
        const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;
        const token = jsonwebtoken_1.default.sign(jwtPayload, secret, { expiresIn: maxAge });
        user.resetPasswordToken = token;
        user.resetPasswordOtp = otpToken;
        user.resetPasswordOtpExpires = otpExpires;
        yield user.save();
        const resetLink = `http://localhost:3000/users/${user._id}/reset-password/${token}`;
        const emailContent = `
      Şifrenizi değiştirmek için aşağıdaki bağlantıyı kullanabilirsiniz: 
      ${resetLink}
      
      Alternatif olarak, OTP kodunuzu kullanarak şifrenizi değiştirebilirsiniz: ${otpToken}
    `;
        yield mailTransporter_1.default.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Şifre Değiştirme Talebi",
            text: emailContent,
        });
        res.status(200).json({
            message: "Şifre değiştirme bağlantısı e-posta adresinize gönderildi.",
            data: { token },
            isSuccess: true,
            isError: false,
        });
    }
    catch (error) {
        console.error("=== Şifre Sıfırlama Hatası ===");
        console.error("Timestamp:", new Date().toISOString());
        console.error("Error Type:", ((_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name) || "Unknown");
        console.error("Request Body:", req.body);
        console.error("User Email:", ((_b = req.body) === null || _b === void 0 ? void 0 : _b.email) || "No email provided");
        console.error("Full Error Object:", JSON.stringify(error, null, 2));
        console.error("================================");
        res.status(500).json({
            message: "Bir hata oluştu, lütfen tekrar deneyiniz.",
            isSuccess: false,
            isError: true,
        });
    }
});
exports.resetPasswordSendEmailController = resetPasswordSendEmailController;
exports.default = exports.resetPasswordSendEmailController;
