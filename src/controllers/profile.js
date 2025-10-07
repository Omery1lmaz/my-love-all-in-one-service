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
exports.profileController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const user_profile_updated_publisher_1 = require("../events/publishers/user-profile-updated-publisher");
const nats_wrapper_1 = require("../nats-wrapper");
const profileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Lütfen giriş yapın" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const { profile } = req.body;
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const updatedUser = yield user_1.User.findByIdAndUpdate(decodedToken.id, { $set: profile }, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        yield new user_profile_updated_publisher_1.UserProfileUpdatedPublisher(nats_wrapper_1.natsWrapper.client).publish({
            id: updatedUser._id,
            version: updatedUser.version - 1,
            name: profile.name,
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Hata:", error);
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.profileController = profileController;
exports.default = exports.profileController;
