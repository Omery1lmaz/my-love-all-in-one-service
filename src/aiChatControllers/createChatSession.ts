import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import { v4 as uuidv4 } from "uuid";
import { LIFE_COACHES } from "../utils/aiClient";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const createChatSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { title, coachType = "general", coachId } = req.body;

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

    // Koç türü kontrolü
    const validCoachTypes = ["general", "relationship_coach", "career_coach", "health_coach", "personal_development_coach", "financial_coach"];
    if (!validCoachTypes.includes(coachType)) {
      res.status(400).json({ message: "Geçersiz koç türü" });
      return;
    }
    console.log("coachType test deneme")
    console.log(coachId, "coachId")

    // Eğer koç ID'si verilmişse, geçerli olup olmadığını kontrol et
    if (coachId && !Object.values(LIFE_COACHES).find(c => c.id === coachId)) {
      res.status(400).json({ message: "Geçersiz koç ID'si test deneme" });
      return;
    }

    // Session ID oluştur
    const sessionId = uuidv4();

    // Varsayılan başlık belirle
    let sessionTitle = title || "Yeni Sohbet";

    // Eğer koç türü belirtilmişse, koç adını başlığa ekle
    if (coachType !== "general" && coachId) {
      const coach = Object.values(LIFE_COACHES).find(c => c.id === coachId);
      if (coach) {
        sessionTitle = `${coach.name} ile Sohbet`;
      }
    }

    // Yeni session oluştur
    const newSession = AIChatSession.build({
      userId: user._id,
      sessionId,
      title: sessionTitle,
      messages: [],
      isActive: true,
      coachType,
      coachId: coachId || null,
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId: newSession.sessionId,
        title: newSession.title,
        coachType: newSession.coachType,
        coachId: newSession.coachId,
        messageCount: 0,
        createdAt: newSession.createdAt,
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
