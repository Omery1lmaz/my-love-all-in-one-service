import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const getChatMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { sessionId } = req.params;

  if (!authHeader) {
    
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("no token");
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };
    const user = await User.findById(
      new mongoose.Types.ObjectId(decodedToken.id)
    );

    if (!user) {
      res.status(401).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    if (!sessionId) {
      res.status(400).json({ message: "Session ID gereklidir" });
      return;
    }

    const session = await AIChatSession.findOne({ 
      sessionId, 
      userId: user._id, 
      isActive: true 
    }).select('sessionId title messages createdAt updatedAt');

    if (!session) {
      res.status(404).json({ message: "Chat session bulunamadı" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
