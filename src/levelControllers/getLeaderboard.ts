import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserLevel } from "../Models/userLevel";
import { User } from "../Models/user";

export const getLeaderboardController = async (req: Request, res: Response) => {
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

    const { type = "all_time", limit = 50 } = req.query;

    // Get leaderboard based on type
    let sortField = "totalPoints";
    let sortOrder = -1;
    
    switch (type) {
      case "weekly":
        sortField = "weeklyPoints";
        break;
      case "monthly":
        sortField = "monthlyPoints";
        break;
      case "streak":
        sortField = "streakDays";
        break;
      case "activities":
        sortField = "totalActivities";
        break;
      default:
        sortField = "totalPoints";
    }

    // Get top users
    const topUsers = await UserLevel.find({})
      .populate('userId', 'name email profilePhoto')
      .sort({ points: -1 })
      .limit(parseInt(limit as string));

    // Get current user's rank
    const currentUserLevel = await UserLevel.findOne({ userId: decodedToken.id });
    let currentUserRank = null;
    
    if (currentUserLevel) {
      const usersAbove = await UserLevel.countDocuments({
        points: { $gt: currentUserLevel.points }
      });
      currentUserRank = usersAbove + 1;
    }

    // Format leaderboard data
    const leaderboard = topUsers.map((userLevel, index) => ({
      rank: index + 1,
      userId: userLevel.userId,
      name: userLevel.userId?.name || 'Unknown',
      profilePhoto: userLevel.userId?.profilePhoto || null,
      currentLevel: userLevel.currentLevel,
      currentLevelTitle: userLevel.currentLevelTitle,
      points: userLevel.points,
      isCurrentUser: userLevel.userId?.toString() === decodedToken.id
    }));

    // Get statistics
    const totalUsers = await UserLevel.countDocuments();
    const averagePoints = await UserLevel.aggregate([
      { $group: { _id: null, avgPoints: { $avg: "$points" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        currentUserRank,
        statistics: {
          totalUsers,
          averagePoints: averagePoints[0]?.avgPoints || 0,
          type: type as string
        },
        pagination: {
          limit: parseInt(limit as string),
          total: totalUsers
        }
      }
    });

  } catch (error) {
    console.error("getLeaderboardController error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası" 
    });
  }
};
