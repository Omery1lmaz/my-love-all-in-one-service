"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpoPushTokenRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateExpoPushToken_1 = require("../controllers/updateExpoPushToken");
const updateExpoPushToken_2 = require("../expressValidators/updateExpoPushToken");
const router = express_1.default.Router();
exports.updateExpoPushTokenRouter = router;
router.put("/expo-push-token", updateExpoPushToken_2.updateExpoPushTokenValidator, updateExpoPushToken_1.updateExpoPushTokenController);
