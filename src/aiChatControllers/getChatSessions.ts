import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const getChatSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { coachType, coachId } = req.query;

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

    // Filtreleme seçenekleri
    let filterQuery: any = { userId: user._id, isActive: true };
    
    if (coachType) {
      filterQuery.coachType = coachType;
    }
    
    if (coachId) {
      filterQuery.coachId = coachId;
    }

    const sessions = await AIChatSession.find(filterQuery)
      .sort({ updatedAt: -1 })
      .select('sessionId title createdAt updatedAt messages coachType coachId')
      .lean();

    // Her session için mesaj sayısını hesapla
    const sessionsWithMessageCount = sessions.map(session => ({
      sessionId: session.sessionId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      lastMessage: session.messages.length > 0 ? session.messages[session.messages.length - 1] : null,
      coachType: session.coachType,
      coachId: session.coachId,
    }));

    res.status(200).json({
      success: true,
      data: sessionsWithMessageCount,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
