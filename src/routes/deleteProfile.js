"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfileRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const deleteProfile_1 = __importDefault(require("../controllers/deleteProfile"));
const router = express_1.default.Router();
exports.deleteProfileRouter = router;
router.delete("/profile", common_1.validateRequest, deleteProfile_1.default);
