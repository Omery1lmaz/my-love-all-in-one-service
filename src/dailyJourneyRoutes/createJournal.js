"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJournalRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const createJournal_1 = __importDefault(require("../dailyJourneyExpressValidators/createJournal"));
const createJournal_2 = __importDefault(require("../dailyJourneyControllers/createJournal"));
const router = express_1.default.Router();
exports.createJournalRouter = router;
router.post("/create-journal", createJournal_1.default, my_love_common_1.validateRequest, createJournal_2.default);
