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
exports.registerResendOTPController = void 0;
const user_1 = require("../Models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateOTP_1 = require("../helpers/generateOTP");
const registerResendOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("registerResendOTPController");
        const { token } = req.query;
        console.log("token", token);
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const existUser = yield user_1.User.findById(decodedToken.id);
        if (!existUser || existUser.isActive) {
            res.status(404).json({
                message: "User not found",
                success: false,
                data: null,
                error: true,
            });
            return;
        }
        const newOtp = (0, generateOTP_1.generateOTP)();
        existUser.otp = newOtp;
        existUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield existUser.save();
        res.status(200).json({
            message: "OTP sent successfully",
            success: true,
            data: null,
            error: false,
        });
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        res.status(400).json({
            message: "Invalid token or user not found",
            success: false,
            data: null,
            error: true,
        });
    }
});
exports.registerResendOTPController = registerResendOTPController;
exports.default = exports.registerResendOTPController;
