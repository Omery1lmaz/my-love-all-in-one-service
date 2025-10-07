import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserAchievement, Achievement } from "../Models/achievement";
import { User } from "../Models/user";

export const getUserAchievementsController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token bulunamadı" });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Get user achievements
    const userAchievements = await UserAchievement.find({ userId: decodedToken.id })
      .populate('achievementId');
    
    // Get all achievements
    const allAchievements = await Achievement.find({});

    res.status(200).json({
      success: true,
      data: {
        userAchievements: userAchievements.map(ua => ({
          id: ua._id,
          achievementId: ua.achievementId,
          dateEarned: ua.dateEarned,
          metadata: ua.metadata
        })),
        totalAchievements: allAchievements.length,
        earnedAchievements: userAchievements.length
      }
    });

  } catch (error) {
    console.error("getUserAchievementsController error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası" 
    });
  }
};