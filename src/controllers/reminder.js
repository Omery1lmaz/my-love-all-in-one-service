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
exports.addReminder = void 0;
const user_1 = require("../Models/user");
const common_1 = require("@heaven-nsoft/common");
const addReminder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, date, description } = req.body;
    const user = yield user_1.User.findById(req.currentUser.id);
    if (!user) {
        throw new common_1.NotFoundError();
    }
    user.reminders = user.reminders || [];
    user.reminders.push({
        title,
        date: new Date(date),
        description,
        isCompleted: false,
    });
    yield user.save();
    res.status(200).json({
        message: "Reminder added successfully",
        status: "success",
        statusCode: 200,
        data: user,
    });
});
exports.addReminder = addReminder;
