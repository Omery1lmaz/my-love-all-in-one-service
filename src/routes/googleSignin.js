"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSigninRouter = void 0;
const express_1 = __importDefault(require("express"));
const googleSignin_1 = __importDefault(require("../controllers/googleSignin"));
const router = express_1.default.Router();
exports.googleSigninRouter = router;
router.post("/google-signin", 
// googleSigninExpressValidator,
// validateRequest,
googleSignin_1.default);
