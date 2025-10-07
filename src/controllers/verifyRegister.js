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
exports.verifyRegisterController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const createToken_1 = require("../helpers/createToken");
const verifyRegisterController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, otp } = req.params;
    console.log("token otp", token, otp);
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield user_1.User.findById(decodedToken.id);
        console.log("user", user === null || user === void 0 ? void 0 : user.otp);
        if (!user) {
            console.log("user yok");
            res.status(400).json({
                isVerify: true,
                message: "Kullanıcı yok",
            });
            return;
        }
        if (user.isActive) {
            console.log("user aktif");
            res.status(201).json({
                isVerify: true,
                message: "Kullanıcı Emaili onaylandı",
            });
            return;
        }
        if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
            console.log("otp süresi dolmuş");
            res.status(400).json({
                isVerify: true,
                message: "Otp süresi dolmuş",
            });
            return;
        }
        if (parseInt(user.otp || "") !== parseInt(otp)) {
            console.log("otp yanlış");
            res.status(400).json({
                message: "Girdiğiniz OTP uyuşmuyor",
            });
            return;
        }
        // Kullanıcı aktif hale getiriliyor
        yield user_1.User.findOneAndUpdate({ email: user.email }, { isActive: true, otp: null, otpExpires: null });
        console.log("user updated", user);
        const newToken = (0, createToken_1.createToken)(user._id, user.partnerId);
        res.cookie("token", newToken);
        res.status(201).json({
            isVerify: true,
            message: "Hesabınız Onaylandı",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                token: newToken,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({
            isVerify: true,
            message: "Token geçersiz veya kullanıcı yok",
        });
    }
});
exports.verifyRegisterController = verifyRegisterController;
exports.default = exports.verifyRegisterController;
