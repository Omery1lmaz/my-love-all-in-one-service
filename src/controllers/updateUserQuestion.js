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
exports.updateUserQuestionController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const mongoose_1 = __importDefault(require("mongoose"));
const updateUserQuestionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    const { question } = req.body;
    const { id } = req.params;
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
        const user = yield user_1.User.findById(new mongoose_1.default.Types.ObjectId(decodedToken.id));
        if (!user) {
            res.status(404).json({ message: "Kullanıcı bulunamadı" });
            return;
        }
        if (!user.questions) {
            next(new common_1.NotFoundError());
            return;
        }
        const existQuestion = (_a = user.questions) === null || _a === void 0 ? void 0 : _a.findIndex((i) => i._id);
        if (existQuestion) {
            user.questions[existQuestion].question = question.question;
            user.questions[existQuestion].userScore = question.userScore;
        }
        yield user.save();
        console.log(user.hobbies, "user.hobbies");
        res.status(200).json({
            message: "Question güncellendi",
            status: "success",
            statusCode: 200,
            data: user,
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.updateUserQuestionController = updateUserQuestionController;
exports.default = exports.updateUserQuestionController;
