"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMoodRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const updateMood_1 = __importDefault(require("../controllers/updateMood"));
const updateMood_2 = __importDefault(require("../expressValidators/updateMood"));
const router = express_1.default.Router();
exports.updateMoodRouter = router;
router.post("/update-user-mood", updateMood_2.default, common_1.validateRequest, updateMood_1.default);
