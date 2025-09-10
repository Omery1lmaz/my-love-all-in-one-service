import { Request, Response } from "express";
import { OnlineStatus } from "../Models/onlineStatus";
import { User } from "../Models/user";

export const getPartnerOnlineStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser!.id;

    // Get user's partner
    const user = await User.findById(userId);
    if (!user || !user.partnerId) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Get partner's online status
    const partnerOnlineStatus = await OnlineStatus.findOne({ userId: user.partnerId });

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

  } catch (error) {
    console.error("Error getting partner online status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}; 