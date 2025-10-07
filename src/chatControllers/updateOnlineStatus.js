"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOnlineStatus = void 0;
const onlineStatus_1 = require("../Models/onlineStatus");
const updateOnlineStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.currentUser.id;
        const { isOnline, socketId } = req.body;
        // Find or create online status
        let onlineStatus = yield onlineStatus_1.OnlineStatus.findOne({ userId });
        if (!onlineStatus) {
            onlineStatus = onlineStatus_1.OnlineStatus.build({
                userId,
                isOnline: isOnline || false,
                lastSeen: new Date(),
                socketId
            });
        }
        else {
            onlineStatus.isOnline = isOnline || false;
            onlineStatus.lastSeen = new Date();
            if (socketId) {
                onlineStatus.socketId = socketId;
            }
        }
        yield onlineStatus.save();
        res.status(200).json({
            success: true,
            message: "Online status updated successfully",
            data: {
                isOnline: onlineStatus.isOnline,
                lastSeen: onlineStatus.lastSeen
            }
        });
    }
    catch (error) {
        console.error("Error updating online status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.updateOnlineStatus = updateOnlineStatus;
