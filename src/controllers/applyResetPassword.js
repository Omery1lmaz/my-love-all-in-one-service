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
exports.applyResetPasswordController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const applyResetPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("test deneme reset password applt");
        const authHeader = req.headers.authorization;
        const { otpToken } = req.body;
        if (!authHeader) {
            console.log("authHeader yok");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (_a) {
            console.log("decodedToken yok");
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("decodedToken.id yok");
            next(new common_1.BadRequestError("User ID not found"));
            return;
        }
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user) {
            console.log("user yok");
            next(new common_1.BadRequestError("Kullanıcı bulunamadı veya hesabınız aktif değil."));
            return;
        }
        // const jwtPayload = { id: user._id, password: user.password };
        // const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;
        // const token = jwt.sign(jwtPayload, secret, { expiresIn: maxAge });
        const existsResetPasswordOtpExpires = user.resetPasswordOtpExpires;
        const existsResetPasswordToken = user.resetPasswordOtp;
        console.log("user resetPasswordOtp", user.resetPasswordOtp);
        console.log("otpToken", otpToken);
        if (otpToken !== user.resetPasswordOtp) {
            console.log("otpToken !== user.resetPasswordOtp", otpToken, user.resetPasswordOtp);
            next(new common_1.BadRequestError("OTP uyuşmuyor."));
            return;
        }
        // Token'ın ve son kullanma tarihinin kontrolü
        if (!user.resetPasswordOtpExpires ||
            user.resetPasswordOtpExpires < new Date()) {
            console.log("user.resetPasswordOtpExpires < new Date()");
            next(new common_1.BadRequestError("Şifre sıfırlama tokenı süresi dolmuş veya geçersiz."));
            return;
        }
        if (!user.newPassword) {
            console.log("user.newPassword");
            next(new common_1.BadRequestError("Yeni şifre bulunamadı."));
            return;
        }
        if (existsResetPasswordOtpExpires) {
            console.log("existsResetPasswordOtpExpires");
            user.resetPasswordOtpExpires = undefined;
        }
        if (existsResetPasswordToken) {
            user.resetPasswordOtp = undefined;
        }
        if (existsResetPasswordToken) {
            console.log("existsResetPasswordToken");
            user.resetPasswordOtp = undefined;
        }
        user.password = user.newPassword;
        console.log("user.password = user.newPassword");
        user.newPassword = undefined;
        yield user.save();
        console.log("user.save");
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
exports.applyResetPasswordController = applyResetPasswordController;
exports.default = exports.applyResetPasswordController;
