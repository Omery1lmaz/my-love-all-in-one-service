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
exports.answerPartnerQuestionController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const mongoose_1 = __importDefault(require("mongoose"));
const aiClient_1 = require("../utils/aiClient");
const answerPartnerQuestionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const { id } = req.params;
    const { answer } = req.body;
    console.log("answer partner question", id, answer);
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
        if (!user || !user.partnerId) {
            next(new common_1.NotFoundError());
            return;
        }
        const partner = yield user_1.User.findById(user.partnerId);
        if (!partner) {
            next(new common_1.BadRequestError("Partner not found"));
            return;
        }
        if (!(partner === null || partner === void 0 ? void 0 : partner.questions)) {
            next(new common_1.BadRequestError("Partner hase not any question"));
            return;
        }
        console.log(partner.questions, "partner questions");
        const questionIndex = partner.questions.findIndex((question) => {
            const t = question._id.toString() == id;
            console.log(t, "t deneme");
            return t;
        });
        if (questionIndex === -1) {
            next(new common_1.BadRequestError("Question not found"));
            return;
        }
        partner.questions[questionIndex].partnerAnswer = answer;
        partner.save();
        try {
            // const airesponse = await main()
            const airesponse = yield (0, aiClient_1.askAIQuestionAnalysis)({
                partnerAnswer: partner.questions[questionIndex].partnerAnswer,
                question: partner.questions[questionIndex].question,
                userAnswer: partner.questions[questionIndex].answer
            });
            if (airesponse.status == "success") {
                partner.questions[questionIndex].aiMessage = airesponse.yorum;
                partner.questions[questionIndex].aiScore = Number(airesponse.puan) || 0;
                partner.questions[questionIndex].aiSuggestion = airesponse.tavsiye;
                partner.save();
            }
            console.log(airesponse, "ai response");
        }
        catch (error) {
            console.log(error, "error test deneme");
        }
        res.status(200).json({
            message: "Cevap güncellendi",
            status: "success",
            statusCode: 200,
            data: (partner === null || partner === void 0 ? void 0 : partner.questions) || [],
        });
    }
    catch (error) {
        console.log(error, "error");
        res.status(400).json({ message: "Kimlik doğrulama başarısız" });
    }
});
exports.answerPartnerQuestionController = answerPartnerQuestionController;
exports.default = exports.answerPartnerQuestionController;
