"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerJournalsRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const getPartnerJournals_1 = __importDefault(require("../dailyJourneyControllers/getPartnerJournals"));
const router = express_1.default.Router();
exports.getPartnerJournalsRouter = router;
router.get("/partner-journals", common_1.validateRequest, getPartnerJournals_1.default);
