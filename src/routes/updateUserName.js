"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserNameRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const profile_1 = __importDefault(require("../expressValidators/profile"));
const updateUserName_1 = __importDefault(require("../controllers/updateUserName"));
const router = express_1.default.Router();
exports.updateUserNameRouter = router;
router.post("/update-userName", profile_1.default, common_1.validateRequest, updateUserName_1.default);
