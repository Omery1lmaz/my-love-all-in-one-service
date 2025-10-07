"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRegisterEmailRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const checkRegisterEmail_1 = __importDefault(require("../expressValidators/checkRegisterEmail"));
const checkRegisterEmail_2 = __importDefault(require("../controllers/checkRegisterEmail"));
const router = express_1.default.Router();
exports.checkRegisterEmailRouter = router;
router.post("/check-register-email", checkRegisterEmail_1.default, common_1.validateRequest, checkRegisterEmail_2.default);
