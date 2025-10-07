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
exports.getPartnerOnlineStatus = void 0;
const onlineStatus_1 = require("../Models/onlineStatus");
const user_1 = require("../Models/user");
const getPartnerOnlineStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.currentUser.id;
        // Get user's partner
        const user = yield user_1.User.findById(userId);
        if (!user || !user.partnerId) {
            return res.status(404).json({ message: "Partner not found" });
        }
        // Get partner's online status
        const partnerOnlineStatus = yield onlineStatus_1.OnlineStatus.findOne({ userId: user.partnerId });
        if (!partnerOnlineStatus) {
            return res.status(200).json({
                success: true,
                data: {
                    isOnline: false,
                    lastSeen: null
                }
            });
        }
        res.status(200).json({
            success: true,
            data: {
                isOnline: partnerOnlineStatus.isOnline,
                lastSeen: partnerOnlineStatus.lastSeen
            }
        });
    }
    catch (error) {
        console.error("Error getting partner online status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.getPartnerOnlineStatus = getPartnerOnlineStatus;
