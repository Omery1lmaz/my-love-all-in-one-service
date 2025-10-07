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
exports.deleteMessage = void 0;
const chat_1 = require("../Models/chat");
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        const userId = req.currentUser.id;
        // Find message
        const message = yield chat_1.Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        // Check if user is the sender
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }
        // Delete message
        yield chat_1.Message.findByIdAndDelete(messageId);
        res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.deleteMessage = deleteMessage;
