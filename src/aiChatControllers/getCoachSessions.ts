import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import { LIFE_COACHES } from "../utils/aiClient";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const getCoachSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { coachId } = req.params;

  if (!authHeader) {
    console.log("no authHeader");
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

    if (!coachId) {
      res.status(400).json({ message: "Koç ID'si gereklidir" });
      return;
    }

    // Koç ID'sinin geçerli olup olmadığını kontrol et
    const coach = Object.values(LIFE_COACHES).find(c => c.id === coachId);
    if (!coach) {
      res.status(404).json({ message: "Koç bulunamadı" });
      return;
    }

    // Bu koç ile olan tüm session'ları getir
    const sessions = await AIChatSession.find({ 
      userId: user._id, 
      coachId, 
      isActive: true 
    })
      .sort({ updatedAt: -1 })
      .select('sessionId title createdAt updatedAt messages')
      .lean();

    // Her session için mesaj sayısını hesapla
    const sessionsWithMessageCount = sessions.map(session => ({
      sessionId: session.sessionId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      lastMessage: session.messages.length > 0 ? session.messages[session.messages.length - 1] : null,
      coachId: session.coachId,
    }));

    res.status(200).json({
      success: true,
      data: {
        coach: {
          id: coach.id,
          name: coach.name,
          description: coach.description,
        },
        sessions: sessionsWithMessageCount,
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
