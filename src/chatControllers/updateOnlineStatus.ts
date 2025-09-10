import { Request, Response } from "express";
import { OnlineStatus } from "../Models/onlineStatus";

export const updateOnlineStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser!.id;
    const { isOnline, socketId } = req.body;

    // Find or create online status
    let onlineStatus = await OnlineStatus.findOne({ userId });

    if (!onlineStatus) {
      onlineStatus = OnlineStatus.build({
        userId,
        isOnline: isOnline || false,
        lastSeen: new Date(),
        socketId
      });
    } else {
      onlineStatus.isOnline = isOnline || false;
      onlineStatus.lastSeen = new Date();
      if (socketId) {
        onlineStatus.socketId = socketId;
      }
    }

    await onlineStatus.save();

    res.status(200).json({
      success: true,
      message: "Online status updated successfully",
      data: {
        isOnline: onlineStatus.isOnline,
        lastSeen: onlineStatus.lastSeen
      }
    });

  } catch (error) {
    console.error("Error updating online status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}; 