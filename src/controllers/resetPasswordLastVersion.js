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
exports.resetPasswordLastVersionController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const generateOTP_1 = require("../helpers/generateOTP");
const mailTransporter_1 = __importDefault(require("../utils/mailTransporter"));
const common_1 = require("@heaven-nsoft/common");
const resetPasswordLastVersionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("test deneme reset password");
        const authHeader = req.headers.authorization;
        const { newPassword, newPasswordConfirm } = req.body;
        if (newPassword !== newPasswordConfirm) {
            console.log("şifreler eşleşmiyor");
            return next(new common_1.BadRequestError("Şifreler eşleşmiyor"));
        }
        if (!authHeader) {
            console.log("token yok");
            return next(new common_1.NotAuthorizedError());
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (_a) {
            console.log("token geçersiz");
            return next(new common_1.NotAuthorizedError());
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("user id yok");
            return next(new common_1.BadRequestError("User ID not found"));
        }
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user) {
            console.log("user yok");
            next(new common_1.BadRequestError("Kullanıcı bulunamadı veya hesabınız aktif değil."));
            return;
        }
        const otpToken = (0, generateOTP_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP 10 dakika geçerli
        console.log("otpToken", otpToken);
        console.log("otpExpires", otpExpires);
        // const jwtPayload = { id: user._id, password: user.password };
        // const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;
        // const token = jwt.sign(jwtPayload, secret, { expiresIn: maxAge });
        console.log("yeni şifre var");
        user.resetPasswordToken = decodedToken.id;
        user.resetPasswordOtp = otpToken;
        user.resetPasswordOtpExpires = otpExpires;
        user.newPassword = newPassword;
        yield user.save();
        const resetLink = `http://localhost:3000/users/${user._id}/reset-password/${decodedToken.id}`;
        const emailContent = `
      Şifrenizi değiştirmek için aşağıdaki bağlantıyı kullanabilirsiniz: 
      ${resetLink}
      
      Alternatif olarak, OTP kodunuzu kullanarak şifrenizi değiştirebilirsiniz: ${otpToken}
    `;
        yield mailTransporter_1.default.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
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
        console.error("Şifre sıfırlama hatası:", error);
        res
            .status(500)
            .json({ message: "Bir hata oluştu, lütfen tekrar deneyiniz." });
    }
});
exports.resetPasswordLastVersionController = resetPasswordLastVersionController;
exports.default = exports.resetPasswordLastVersionController;
