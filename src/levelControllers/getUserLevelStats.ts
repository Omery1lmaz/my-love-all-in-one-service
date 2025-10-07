import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserLevel } from "../Models/userLevel";
import { UserAchievement } from "../Models/achievement";
import { User } from "../Models/user";

export const getUserLevelStatsController = async (req: Request, res: Response) => {
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

    // Get user level
    const userLevel = await UserLevel.findOne({ userId: decodedToken.id });
    if (!userLevel) {
      return res.status(404).json({ message: "Kullanıcı seviyesi bulunamadı" });
    }

    // Get achievement statistics
    const totalAchievements = await UserAchievement.countDocuments({ userId: decodedToken.id });

    // Get recent achievements (last 5)
    const recentAchievements = await UserAchievement.find({ 
      userId: decodedToken.id
    })
    .populate('achievementId')
    .sort({ dateEarned: -1 })
    .limit(5);

    // Get partner level if exists
    let partnerLevel = null;
    if (user.partnerId) {
      partnerLevel = await UserLevel.findOne({ userId: user.partnerId });
    }

    res.status(200).json({
      success: true,
      data: {
        userLevel: {
          currentLevel: userLevel.currentLevel,
          currentLevelTitle: userLevel.currentLevelTitle,
          points: userLevel.points,
          pointsHistory: userLevel.pointsHistory,
          levelUpHistory: userLevel.levelUpHistory,
          lastActivity: userLevel.lastActivity
        },
        achievements: {
          total: totalAchievements,
          recent: recentAchievements.map(ua => ({
            id: ua._id,
            achievementId: ua.achievementId,
            dateEarned: ua.dateEarned
          }))
        },
        partner: partnerLevel ? {
          currentLevel: partnerLevel.currentLevel,
          currentLevelTitle: partnerLevel.currentLevelTitle,
          points: partnerLevel.points
        } : null,
        statistics: {
          totalUsers: await UserLevel.countDocuments(),
          averagePoints: await UserLevel.aggregate([
            { $group: { _id: null, avgPoints: { $avg: "$points" } } }
          ]).then(result => result[0]?.avgPoints || 0)
        }
      }
    });

  } catch (error) {
    console.error("getUserLevelStatsController error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası" 
    });
  }
};
