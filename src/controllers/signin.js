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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinController = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const createToken_1 = require("../helpers/createToken");
const signinController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Kullanıcıyı email ile bul
        const user = yield user_1.User.findOne({ email }).select("+password");
        if (!user) {
            next(new common_1.BadRequestError("Kullanıcı bulunamadı"));
            return;
        }
        if (user.provider !== "email" && !user.password) {
            console.log("Bu kullanıcı farklı bir sağlayıcıya bağlı");
            next(new common_1.BadRequestError("Bu kullanıcı farklı bir sağlayıcıya bağlı"));
            return;
        }
        if (user.isDeleted) {
            next(new common_1.BadRequestError("Bu hesap silinmiştir"));
            return;
        }
        // Kullanıcı aktif mi?
        if (!user.isActive) {
            next(new common_1.BadRequestError("Lütfen emailinizi onaylayınız"));
            return;
        }
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            next(new common_1.BadRequestError("Hesap bilgileri uyuşmuyor"));
            return;
        }
        const token = (0, createToken_1.createToken)(user._id, user.partnerId);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({
            _id: user._id,
            email: user.email,
            name: user.name,
            token: token,
        });
    }
    catch (error) {
        next(new common_1.BadRequestError("Hesap bilgileri uyuşmuyor"));
    }
});
exports.signinController = signinController;
exports.default = exports.signinController;
