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
exports.resetPasswordVerifyOTPController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const resetPasswordVerifyOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { token, otp, email } = req.params;
        const user = yield user_1.User.findOne({ email: email });
        console.log("user", user);
        if (!user) {
            console.log("Kullanıcı bulunamadı veya hesap onaylanmamış");
            res.status(400).json({
                message: "Kullanıcı bulunamadı veya hesap onaylanmamış",
            });
            return;
        }
        const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;
        jsonwebtoken_1.default.verify(token, secret, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log("Şifre değiştirme linki geçerli değil");
                res.status(400).json({
                    message: "Şifre değiştirme linki geçerli değil",
                });
            }
            if (!user.resetPasswordOtpExpires ||
                user.resetPasswordOtpExpires < new Date()) {
                console.log("OTP süresi dolmuş");
                res.status(400).json({
                    isVerify: true,
                    message: "OTP süresi dolmuş",
                });
            }
            if (!user.resetPasswordOtp ||
                parseInt(user.resetPasswordOtp, 10) !== parseInt(otp, 10)) {
                console.log("Girdiğiniz OTP uyuşmuyor");
                res.status(400).json({
                    message: "Girdiğiniz OTP uyuşmuyor",
                });
                return;
            }
            res.status(200).json({
                message: "Şifre değiştirme linki geçerli",
                status: "success",
                statusCode: 200,
            });
        }));
    }
    catch (error) {
        console.error("Hata:", error);
        console.error("Timestamp:", new Date().toISOString());
        console.error("Error Type:", ((_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name) || "Unknown");
        console.error("Request Params:", req.params);
        console.error("Request Body:", req.body);
        console.error("Request Query:", req.query);
        console.error("Request Headers:", req.headers);
        console.error("Request Cookies:", req.cookies);
        console.error("================================");
        res.status(500).json({
            message: "Sunucu hatası, lütfen tekrar deneyin",
        });
    }
});
exports.resetPasswordVerifyOTPController = resetPasswordVerifyOTPController;
exports.default = exports.resetPasswordVerifyOTPController;
