import { Request, Response } from "express";
import { User } from "../Models/user";
import { body } from "express-validator";

export const updateExpoPushTokenController = async (req: Request, res: Response) => {
    try {
        const { expoPushToken } = req.body;
        const userId = req.currentUser!.id;

        if (!expoPushToken) {
            res.status(400).json({
                success: false,
                message: "Expo push token is required"
            });
            return
        }

        // Kullanıcıyı bul ve push token'ı güncelle
        const user = await User.findByIdAndUpdate(
            userId,
            { expoPushToken },
            { new: true }
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return
        }

        res.status(200).json({
            success: true,
            message: "Expo push token updated successfully",
            data: {
                userId: user._id,
                expoPushToken: user.expoPushToken
            }
        });
    } catch (error) {
        console.error("Error updating expo push token:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
