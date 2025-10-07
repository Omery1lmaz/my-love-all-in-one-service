"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const signin_1 = __importDefault(require("../controllers/signin"));
const signin_2 = __importDefault(require("../expressValidators/signin"));
const router = express_1.default.Router();
exports.signinRouter = router;
router.post("/signin", signin_2.default, common_1.validateRequest, signin_1.default);
