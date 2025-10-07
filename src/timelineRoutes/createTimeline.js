"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimelineRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const createTimeline_1 = __importDefault(require("../timelineExpressValidators/createTimeline"));
const createTimeline_2 = __importDefault(require("../timelineControllers/createTimeline"));
const upload_1 = __importDefault(require("../utils/upload"));
const router = express_1.default.Router();
exports.createTimelineRouter = router;
router.post("/timeline", upload_1.default.array("photo", 10), createTimeline_1.default, my_love_common_1.validateRequest, createTimeline_2.default);
