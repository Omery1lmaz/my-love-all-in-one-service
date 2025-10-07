"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOnlineStatusRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const updateOnlineStatus_1 = require("../chatControllers/updateOnlineStatus");
const common_1 = require("@heaven-nsoft/common");
const common_2 = require("@heaven-nsoft/common");
const router = express_1.default.Router();
exports.updateOnlineStatusRouter = router;
router.put("/online-status", common_2.requireAuth, [
    (0, express_validator_1.body)("isOnline")
        .isBoolean()
        .withMessage("isOnline must be a boolean"),
    (0, express_validator_1.body)("socketId")
        .optional()
        .isString()
        .withMessage("Socket ID must be a string")
], common_1.validateRequest, updateOnlineStatus_1.updateOnlineStatus);
