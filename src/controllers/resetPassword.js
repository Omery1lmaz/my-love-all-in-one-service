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
exports.resetPasswordController = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resetPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, otp, email, password } = req.params;
    console.log("token", token);
    console.log("otp", otp);
    console.log("email", email);
    console.log("password", password);
    try {
        const user = yield user_1.User.findOne({ email, resetPasswordToken: token });
        if (!user) {
            console.log("Kullanıcı bulunamadı veya hesabı onaylanmamış.");
            next(new common_1.BadRequestError("Kullanıcı bulunamadı veya hesabı onaylanmamış."));
            return;
        }
        const secret = process.env.RESET_PASSWORD_SECRET_KEY + "-" + user.password;
        console.log("secret", secret);
        jsonwebtoken_1.default.verify(token, secret);
        if (user.resetPasswordOtpExpires &&
            user.resetPasswordOtpExpires < new Date(Date.now())) {
            console.log("OTP süresi dolmuş.");
            next(new common_1.BadRequestError("OTP süresi dolmuş."));
            return;
        }
        if (parseInt(user.resetPasswordOtp || "") !== parseInt(otp)) {
            console.log("Girdiğiniz OTP uyuşmuyor.");
            next(new common_1.BadRequestError("Girdiğiniz OTP uyuşmuyor."));
            return;
        }
        user.password = password;
        user.resetPasswordOtpExpires = undefined;
        user.resetPasswordOtp = undefined;
        user.resetPasswordToken = undefined;
        yield user.save();
        console.log("Şifre başarıyla değiştirildi.");
        res.status(200).json({
            message: "Şifre başarıyla değiştirildi.",
            success: true,
        });
    }
    catch (error) {
        console.log("Şifre değiştirme linki geçerli değil.");
        next(new common_1.BadRequestError("Şifre değiştirme linki geçerli değil."));
        return;
    }
});
exports.resetPasswordController = resetPasswordController;
exports.default = exports.resetPasswordController;
