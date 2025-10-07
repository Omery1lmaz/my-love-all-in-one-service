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
exports.getRelationshipStats = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const getRelationshipStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.User.findById(req.currentUser.id);
    if (!user || !user.relationshipStartDate) {
        throw new common_1.NotFoundError();
    }
    const now = new Date();
    const startDate = new Date(user.relationshipStartDate);
    const daysTogether = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const stats = {
        daysTogether,
        moodHistory: user.moodHistory || [],
        timelineEvents: user.relationshipTimeline || [],
        activeReminders: (user.reminders || []).filter((r) => !r.isCompleted),
        journalEntries: (user.dailyJournal || []).filter((j) => !j.isPrivate),
        quizResults: user.relationshipQuizzes || [],
    };
    res.status(200).json({
        message: "Relationship stats fetched successfully",
        status: "success",
        statusCode: 200,
        data: stats,
    });
});
exports.getRelationshipStats = getRelationshipStats;
