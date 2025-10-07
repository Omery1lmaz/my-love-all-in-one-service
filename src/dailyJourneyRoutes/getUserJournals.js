"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserJournalsRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const getUserJournals_1 = __importDefault(require("../dailyJourneyControllers/getUserJournals"));
const router = express_1.default.Router();
exports.getUserJournalsRouter = router;
router.get("/my-journals", my_love_common_1.validateRequest, getUserJournals_1.default);
