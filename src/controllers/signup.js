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
exports.signupController = void 0;
const user_1 = require("../Models/user");
const createToken_1 = require("../helpers/createToken");
const generateOTP_1 = require("../helpers/generateOTP");
const mailTransporter_1 = __importDefault(require("../utils/mailTransporter"));
const generateUniqueInvitationCode_1 = __importDefault(require("../helpers/generateUniqueInvitationCode"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const signupController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        console.log(name, email, password, req.body, "name email password");
        const existingUser = yield user_1.User.findOne({ email, isActive: false });
        if (existingUser && existingUser.isActive) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const otpToken = (0, generateOTP_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const userPartnerCode = yield (0, generateUniqueInvitationCode_1.default)();
        if (existingUser && !(existingUser === null || existingUser === void 0 ? void 0 : existingUser.isActive)) {
            (existingUser.password = password),
                (existingUser.otp = otpToken),
                (existingUser.otpExpires = otpExpires),
                (existingUser.partnerInvitationCode = userPartnerCode),
                existingUser === null || existingUser === void 0 ? void 0 : existingUser.save();
            const token = (0, createToken_1.createToken)(existingUser._id, existingUser.partnerId);
            yield mailTransporter_1.default.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Email Onayı",
                text: `Here is your OTP token: ${otpToken}`,
            });
            res.status(201).json({
                message: "Emailinizi onaylayınız",
                token,
            });
            return;
        }
        const newUser = new user_1.User({
            name,
            email,
            password,
            otp: otpToken,
            otpExpires,
            partnerInvitationCode: userPartnerCode,
        });
        yield newUser.save();
        yield mailTransporter_1.default.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email Onayı",
            text: `Here is your OTP token: ${otpToken}`,
        });
        const token = (0, createToken_1.createToken)(newUser._id, newUser.partnerId);
        res.status(201).json({
            message: "Emailinizi onaylayınız",
            token,
        });
    }
    catch (error) {
        console.error("Kayıt sırasında hata oluştu:", error);
        next(new my_love_common_1.BadRequestError("Kayıt sırasında hata oluştu"));
        yield user_1.User.findOneAndDelete({ email: email });
    }
});
exports.signupController = signupController;
exports.default = exports.signupController;
