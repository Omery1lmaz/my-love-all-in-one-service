"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestNotificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const sendTestNotification_1 = require("../controllers/sendTestNotification");
const router = express_1.default.Router();
exports.sendTestNotificationRouter = router;
router.post("/test-notification", sendTestNotification_1.sendTestNotificationController);
