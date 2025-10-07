"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPartnerCodeRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const verifyPartnerCode_1 = __importDefault(require("../controllers/verifyPartnerCode"));
const verifyPartnerCode_2 = __importDefault(require("../expressValidators/verifyPartnerCode"));
const router = express_1.default.Router();
exports.verifyPartnerCodeRouter = router;
router.post("/verify-partner-code/:otp", verifyPartnerCode_2.default, common_1.validateRequest, verifyPartnerCode_1.default);
