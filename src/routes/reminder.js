"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderRouter = void 0;
const express_1 = __importDefault(require("express"));
const reminder_1 = require("../controllers/reminder");
const router = express_1.default.Router();
exports.reminderRouter = router;
router.post("/add-reminder", reminder_1.addReminder);
