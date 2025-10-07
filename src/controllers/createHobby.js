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
exports.createHobbyController = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createHobbyController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hobby } = req.body;
        console.log("hobby", hobby);
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: "Lütfen giriş yapın" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(400).json({ message: "Token bulunamadı" });
            return;
        }
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            const user = yield user_1.User.findById(decodedToken.id);
            if (!user) {
                console.log("no user");
                next(new common_1.NotAuthorizedError());
                return;
            }
            user.hobbies = user.hobbies || [];
            if (user.hobbies.includes(hobby)) {
                console.log("hobby found");
                next(new common_1.BadRequestError("This hobby already exists."));
                return;
            }
            user.hobbies.push(hobby);
            yield user.save();
            res
                .status(200)
                .send({ message: "Today's song has been set.", songs: user.hobbies });
        }
        catch (error) {
            console.log("errror", error);
            next(new common_1.NotAuthorizedError());
            return;
        }
    }
    catch (err) {
        console.error(err);
        next(new common_1.BadRequestError("An unexpected error occurred."));
    }
});
exports.createHobbyController = createHobbyController;
