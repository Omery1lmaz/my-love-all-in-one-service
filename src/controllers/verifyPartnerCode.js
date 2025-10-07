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
exports.verifyPartnerCodeController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const nats_wrapper_1 = require("../nats-wrapper");
const user_partner_updated_publisher_copy_1 = require("../events/publishers/user-partner-updated-publisher copy");
const verifyPartnerCodeController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.params;
    console.log("token otp", otp);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("no token");
        res.status(400).json({ message: "Token bulunamadı" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield user_1.User.findById(decodedToken.id);
        if (!user) {
            console.log("user yok");
            next(new common_1.BadRequestError("Kullanıcı yok"));
            return;
        }
        // Kullanıcının kendi invitation code'unu kullanmasını engelle
        if (user.partnerInvitationCode === parseInt(otp)) {
            next(new common_1.BadRequestError("Kendi partner kodunuzu kullanamazsınız"));
            return;
        }
        const partner = yield user_1.User.findOne({
            partnerInvitationCode: parseInt(otp),
        });
        if (!partner) {
            console.log("partner yok");
            next(new common_1.BadRequestError("Partner kodu yanlış"));
            return;
        }
        if (partner.partnerId) {
            next(new common_1.BadRequestError("Partner kodu zaten kullanıldı"));
            return;
        }
        if (partner.partnerInvitationCode !== parseInt(otp)) {
            console.log("otp yanlış");
            next(new common_1.BadRequestError("Girdiğiniz OTP uyuşmuyor"));
            return;
        }
        // Kullanıcı aktif hale getiriliyor
        user.partnerId = partner._id;
        user.partnerName = partner.name;
        partner.partnerName = user.name;
        partner.partnerId = user._id;
        yield user.save();
        yield partner.save();
        yield new user_partner_updated_publisher_copy_1.UserPartnerUpdatedPublisher(nats_wrapper_1.natsWrapper.client).publish({
            userId: user._id,
            partnerId: partner._id,
            version: user.version,
        });
        res.status(201).json({
            isVerify: true,
            message: "Hesabınız Onaylandı",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        console.error(err);
        next(new common_1.BadRequestError("Token geçersiz veya kullanıcı yok"));
    }
});
exports.verifyPartnerCodeController = verifyPartnerCodeController;
exports.default = exports.verifyPartnerCodeController;
