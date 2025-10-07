"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRegisterRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const verifyRegister_1 = __importDefault(require("../expressValidators/verifyRegister"));
const verifyRegister_2 = __importDefault(require("../controllers/verifyRegister"));
const router = express_1.default.Router();
exports.verifyRegisterRouter = router;
router.post("/verify-register/:token/:otp", verifyRegister_1.default, common_1.validateRequest, verifyRegister_2.default);
