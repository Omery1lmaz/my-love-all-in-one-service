import { Request, Response } from "express";
import { User } from "../Models/user";
import { expoNotificationService } from "../services/expoNotificationService";

export const sendTestNotificationController = async (req: Request, res: Response) => {
    try {
        const userId = req.currentUser!.id;

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return
        }

        if (!user.expoPushToken) {
            res.status(400).json({
                success: false,
                message: "User does not have an expo push token. Please register your device first."
            });
            return
        }

        // Test notification gönder
        const ticket = await expoNotificationService.sendTestNotification(user.expoPushToken);

        if (!ticket) {
            res.status(500).json({
                success: false,
                message: "Failed to send test notification"
            });
            return
        }

        res.status(200).json({
            success: true,
            message: "Test notification sent successfully",
            data: {
                ticket,
                expoPushToken: user.expoPushToken
            }
        });
    } catch (error) {
        console.error("Error sending test notification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
