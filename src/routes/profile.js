"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const profile_1 = __importDefault(require("../expressValidators/profile"));
const profile_2 = __importDefault(require("../controllers/profile"));
const router = express_1.default.Router();
exports.profileRouter = router;
router.post("/profile", profile_1.default, common_1.validateRequest, profile_2.default);
