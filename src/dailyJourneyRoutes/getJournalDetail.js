"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJournalDetailRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const getJournalDetail_1 = __importDefault(require("../dailyJourneyControllers/getJournalDetail"));
const router = express_1.default.Router();
exports.getJournalDetailRouter = router;
router.get("/journal/:id", common_1.validateRequest, getJournalDetail_1.default);
