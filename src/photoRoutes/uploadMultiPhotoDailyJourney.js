"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiPhotoDailyJourneyRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const uploadMultiPhotoDailyJourney_1 = __importDefault(require("../photoControllers/uploadMultiPhotoDailyJourney"));
const router = express_1.default.Router();
exports.uploadMultiPhotoDailyJourneyRouter = router;
router.post("/upload-multi-daily-journey", upload_1.default.array("photo", 10), uploadMultiPhotoDailyJourney_1.default);
