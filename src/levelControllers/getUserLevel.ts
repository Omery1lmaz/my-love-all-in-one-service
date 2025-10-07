import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserLevel } from "../Models/userLevel";
import { User } from "../Models/user";

export const getUserLevelController = async (req: Request, res: Response) => {
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

    // Get or create user level
    let userLevel = await UserLevel.findOne({ userId: decodedToken.id });
    
    if (!userLevel) {
      // Create initial user level
      userLevel = UserLevel.build({
        userId: new mongoose.Types.ObjectId(decodedToken.id),
        currentLevel: 1,
        currentLevelTitle: "New Flame",
        points: 0,
        pointsHistory: [],
        levelUpHistory: [],
        lastActivity: new Date()
      });
      await userLevel.save();
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
        }
      }
    });

  } catch (error) {
    console.error("getUserLevelController error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Sunucu hatası" 
    });
  }
};
