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
exports.forgetPasswordResendOTPController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const generateOTP_1 = require("../helpers/generateOTP");
const mailTransporter_1 = __importDefault(require("../utils/mailTransporter"));
const forgetPasswordResendOTPController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, email } = req.query;
    try {
        const existUser = yield user_1.User.findOne({ email });
        if (!existUser) {
            res.status(404).send({
                message: "User not found",
                success: false,
                data: null,
                error: true,
            });
            return;
        }
        const secret = process.env.RESET_PASSWORD_SECRET_KEY + "-" + existUser.password;
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, secret);
            if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id) || decodedToken.id !== existUser._id.toString()) {
                next(new common_1.BadRequestError("Invalid token"));
            }
        }
        catch (error) {
            res.status(400).json({
                message: "Invalid or expired reset password link",
                success: false,
                data: null,
                error: true,
            });
        }
        const jwtInfos = {
            id: existUser._id,
            password: existUser.password,
        };
        const maxAge = 3 * 24 * 60 * 60;
        const newToken = jsonwebtoken_1.default.sign(jwtInfos, secret, { expiresIn: maxAge });
        const otp = (0, generateOTP_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        existUser.resetPasswordOtp = otp;
        existUser.resetPasswordOtpExpires = otpExpires;
        existUser.resetPasswordToken = newToken;
        yield existUser.save();
        const url = `http://localhost:3000/users/${existUser._id}/reset-password/${newToken}
    and if you want to change password with OTP token, here is your OTP: "${otp}"`;
        mailTransporter_1.default.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Şifre Değiştirme",
            text: url,
        });
        res.status(200).send({
            message: "OTP sent successfully",
            success: true,
            data: {
                token: newToken,
            },
            error: false,
        });
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).send({
            message: "Internal server error",
            success: false,
            data: null,
            error: true,
        });
    }
});
exports.forgetPasswordResendOTPController = forgetPasswordResendOTPController;
exports.default = exports.forgetPasswordResendOTPController;
