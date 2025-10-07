import mongoose from "mongoose";
import { UserLevel, LOVE_POINTS_ACTIONS } from "../Models/userLevel";
import { UserAchievement, Achievement } from "../Models/achievement";

export class LovePointsService {
  /**
   * Add points to user for a specific action
   */
  static async addPoints(
    userId: string, 
    action: string, 
    metadata?: any
  ): Promise<{
    success: boolean;
    userLevel?: any;
    newAchievements?: any[];
    levelUp?: any;
    message?: string;
  }> {
    try {
      // Get points for action
      const actionData = LOVE_POINTS_ACTIONS.find(a => a.action === action);
      if (!actionData) {
        return {
          success: false,
          message: "Geçersiz action türü"
        };
      }

      // Add points to user level
      const userLevel = await UserLevel.addPoints(userId, action, actionData.points);
      
      // Check for new achievements
      const newAchievements = await this.checkAndUnlockAchievements(userId, action, metadata);
      
      // Check for level up
      const levelUpData = await this.checkLevelUp(userId, userLevel);

      return {
        success: true,
        userLevel: {
          currentLevel: userLevel.currentLevel,
          currentLevelTitle: userLevel.currentLevelTitle,
          currentLevelEmoji: userLevel.currentLevelEmoji,
          totalPoints: userLevel.totalPoints,
          pointsToNextLevel: userLevel.pointsToNextLevel,
          levelProgress: userLevel.levelProgress,
          streakDays: userLevel.streakDays,
          totalActivities: userLevel.totalActivities,
          pointsAdded: actionData.points,
          action: action
        },
        newAchievements,
        levelUp: levelUpData
      };

    } catch (error) {
      console.error("LovePointsService.addPoints error:", error);
      return {
        success: false,
        message: "Puan ekleme hatası"
      };
    }
  }

  /**
   * Check and unlock achievements based on user actions
   */
  private static async checkAndUnlockAchievements(
    userId: string, 
    action: string, 
    metadata: any
  ): Promise<any[]> {
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
            if (action === this.getActionForAchievement(achievement)) {
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

  /**
   * Check if user leveled up
   */
  private static async checkLevelUp(userId: string, userLevel: any): Promise<any> {
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

  /**
   * Map achievement names to actions
   */
  private static getActionForAchievement(achievement: any): string {
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

  /**
   * Get user's current level and progress
   */
  static async getUserLevel(userId: string): Promise<any> {
    try {
      let userLevel = await UserLevel.findOne({ userId });
      
      if (!userLevel) {
        // Create initial user level
        userLevel = await UserLevel.build({
          userId: new mongoose.Types.ObjectId(userId),
          currentLevel: 1,
          totalPoints: 0,
          pointsToNextLevel: 100,
          currentLevelTitle: "New Flame",
          currentLevelEmoji: "💖",
          levelProgress: 0,
          streakDays: 0,
          totalActivities: 0,
          achievements: [],
          weeklyPoints: 0,
          monthlyPoints: 0,
          allTimePoints: 0,
          levelHistory: [],
          pointsBreakdown: {
            dailyNotes: 0,
            photoUploads: 0,
            playlists: 0,
            events: 0,
            comments: 0,
            streaks: 0,
            challenges: 0,
            other: 0
          }
        });
        await userLevel.save();
      }

      return {
        success: true,
        userLevel: {
          currentLevel: userLevel.currentLevel,
          currentLevelTitle: userLevel.currentLevelTitle,
          currentLevelEmoji: userLevel.currentLevelEmoji,
          totalPoints: userLevel.totalPoints,
          pointsToNextLevel: userLevel.pointsToNextLevel,
          levelProgress: userLevel.levelProgress,
          streakDays: userLevel.streakDays,
          totalActivities: userLevel.totalActivities,
          weeklyPoints: userLevel.weeklyPoints,
          monthlyPoints: userLevel.monthlyPoints,
          allTimePoints: userLevel.allTimePoints,
          pointsBreakdown: userLevel.pointsBreakdown,
          levelHistory: userLevel.levelHistory,
          lastActivityDate: userLevel.lastActivityDate
        }
      };

    } catch (error) {
      console.error("LovePointsService.getUserLevel error:", error);
      return {
        success: false,
        message: "Kullanıcı seviyesi alınamadı"
      };
    }
  }

  /**
   * Initialize predefined achievements in database
   */
  static async initializeAchievements(): Promise<void> {
    try {
      const { PREDEFINED_ACHIEVEMENTS } = await import("../Models/achievement");
      
      for (const achievementData of PREDEFINED_ACHIEVEMENTS) {
        const existingAchievement = await Achievement.findOne({ name: achievementData.name });
        
        if (!existingAchievement) {
          const achievement = Achievement.build(achievementData);
          await achievement.save();
          console.log(`Achievement created: ${achievementData.name}`);
        }
      }
      
      console.log("All achievements initialized successfully");
    } catch (error) {
      console.error("Error initializing achievements:", error);
    }
  }

  /**
   * Reset weekly points (should be called weekly)
   */
  static async resetWeeklyPoints(): Promise<void> {
    try {
      await UserLevel.updateMany({}, { weeklyPoints: 0 });
      console.log("Weekly points reset successfully");
    } catch (error) {
      console.error("Error resetting weekly points:", error);
    }
  }

  /**
   * Reset monthly points (should be called monthly)
   */
  static async resetMonthlyPoints(): Promise<void> {
    try {
      await UserLevel.updateMany({}, { monthlyPoints: 0 });
      console.log("Monthly points reset successfully");
    } catch (error) {
      console.error("Error resetting monthly points:", error);
    }
  }
}
