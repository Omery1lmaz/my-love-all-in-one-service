"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRegisterPartnerCodeRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const verifyRegister_1 = __importDefault(require("../expressValidators/verifyRegister"));
const verifyRegisterPartnerCode_1 = __importDefault(require("../controllers/verifyRegisterPartnerCode"));
const router = express_1.default.Router();
exports.verifyRegisterPartnerCodeRouter = router;
router.post("/verify-register-partner-code/:token/:otp", verifyRegister_1.default, common_1.validateRequest, verifyRegisterPartnerCode_1.default);
