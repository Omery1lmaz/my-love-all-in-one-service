"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordRouter = void 0;
const express_1 = __importDefault(require("express"));
const updatePassword_1 = __importDefault(require("../controllers/updatePassword"));
const router = express_1.default.Router();
exports.updatePasswordRouter = router;
router.post("/reset-password-verify/:otp/:token/:email/:password", 
// updatePasswordExpressValidator,
// validateRequest,
updatePassword_1.default);
