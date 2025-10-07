import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserLevel } from "../Models/userLevel";
import { UserAchievement, Achievement } from "../Models/achievement";
import { User } from "../Models/user";

export const addPointsController = async (req: Request, res: Response) => {
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

    const { action, points, metadata } = req.body;

    if (!action || !points) {
      return res.status(400).json({ 
        success: false, 
        message: "Action ve points gerekli" 
      });
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Add points to user level
    const userLevel = await UserLevel.addPoints(decodedToken.id, action, points);
    
    // Check for new achievements
    const newAchievements = await checkAndUnlockAchievements(decodedToken.id, action, metadata);
    
    // Check for level up
    const levelUpData = await checkLevelUp(decodedToken.id, userLevel);

    res.status(200).json({
      success: true,
      data: {
        userLevel: {
          currentLevel: userLevel.currentLevel,
          currentLevelTitle: userLevel.currentLevelTitle,
          currentLevelEmoji: userLevel.currentLevelEmoji,
          totalPoints: userLevel.totalPoints,
          pointsToNextLevel: userLevel.pointsToNextLevel,
          levelProgress: userLevel.levelProgress,
          streakDays: userLevel.streakDays,
          totalActivities: userLevel.totalActivities,
          pointsAdded: points,
          action: action
        },
        newAchievements,
        levelUp: levelUpData
      }
    });

  } catch (error) {
    console.error("addPointsController error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası" 
    });
  }
};

// Helper function to check and unlock achievements
async function checkAndUnlockAchievements(userId: string, action: string, metadata: any) {
  const newAchievements = [];
  
  try {
    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true });
    
    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existingUserAchievement = await UserAchievement.findOne({
        userId,
        achievementId: achievement._id
      });
      
      if (existingUserAchievement && existingUserAchievement.isUnlocked) {
        continue; // Already unlocked
      }
      
      let shouldUnlock = false;
      let newValue = 0;
      
      // Check achievement requirements based on action
      switch (achievement.requirement.type) {
        case "count":
          if (action === getActionForAchievement(achievement)) {
            newValue = (existingUserAchievement?.currentValue || 0) + 1;
            shouldUnlock = newValue >= achievement.requirement.value;
          }
          break;
          
        case "streak":
          if (action === "daily_login" || action === "daily_note") {
            // Get current streak from user level
            const userLevel = await UserLevel.findOne({ userId });
            if (userLevel) {
              newValue = userLevel.streakDays;
              shouldUnlock = newValue >= achievement.requirement.value;
            }
          }
          break;
          
        case "points":
          // Get current total points
          const userLevel = await UserLevel.findOne({ userId });
          if (userLevel) {
            newValue = userLevel.totalPoints;
            shouldUnlock = newValue >= achievement.requirement.value;
          }
          break;
          
        case "date":
          // Special date-based achievements (like night writer)
          if (action === "daily_note" && achievement.name === "Night Writer") {
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 0 && hour <= 4) {
              newValue = (existingUserAchievement?.currentValue || 0) + 1;
              shouldUnlock = newValue >= achievement.requirement.value;
            }
          }
          break;
      }
      
      if (shouldUnlock) {
        // Update or create user achievement
        const userAchievement = await UserAchievement.updateProgress(
          userId,
          achievement._id.toString(),
          newValue
        );
        
        if (userAchievement.isUnlocked) {
          newAchievements.push({
            id: achievement._id,
            name: achievement.name,
            description: achievement.description,
            emoji: achievement.emoji,
            category: achievement.category,
            rarity: achievement.rarity,
            pointsReward: achievement.pointsReward,
            visualStyle: achievement.visualStyle,
            unlockMessage: achievement.unlockMessage,
            unlockedAt: userAchievement.unlockedAt
          });
          
          // Add achievement points to user level
          await UserLevel.addPoints(userId, "achievement_unlock", achievement.pointsReward);
        }
      } else if (newValue > 0) {
        // Update progress even if not unlocked
        await UserAchievement.updateProgress(
          userId,
          achievement._id.toString(),
          newValue
        );
      }
    }
    
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
  
  return newAchievements;
}

// Helper function to check for level up
async function checkLevelUp(userId: string, userLevel: any) {
  // Check if user leveled up in the last update
  const levelHistory = userLevel.levelHistory;
  if (levelHistory && levelHistory.length > 0) {
    const latestLevel = levelHistory[levelHistory.length - 1];
    const now = new Date();
    const timeDiff = now.getTime() - latestLevel.achievedAt.getTime();
    
    // If level was achieved in the last 5 seconds, it's a new level up
    if (timeDiff < 5000) {
      return {
        leveledUp: true,
        newLevel: latestLevel.level,
        newTitle: latestLevel.title,
        emoji: userLevel.currentLevelEmoji,
        pointsAtLevel: latestLevel.pointsAtLevel
      };
    }
  }
  
  return {
    leveledUp: false
  };
}

// Helper function to map achievement names to actions
function getActionForAchievement(achievement: any): string {
  switch (achievement.name) {
    case "Memory Keeper":
      return "photo_upload";
    case "Sound of Love":
      return "playlist_create";
    case "Harmony Seeker":
      return "shared_note";
    case "First Photo Together":
      return "first_photo_together";
    case "Anniversary Master":
      return "anniversary_reminder";
    case "Mood Tracker":
      return "mood_share";
    default:
      return "";
  }
}

