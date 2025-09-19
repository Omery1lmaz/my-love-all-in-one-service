import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import { chatWithAI, chatWithLifeCoach, chatWithGoogleAI, chatWithGoogleLifeCoach, chatWithGoogleAIStream, chatWithGoogleLifeCoachStream } from "../utils/aiClient";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { sessionId, message } = req.body;

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
    console.log("sessionId", sessionId)
    console.log("message", message)
    if (!sessionId || !message) {
      res.status(400).json({ message: "Session ID ve mesaj gereklidir" });
      return;
    }

    // Session'ı bul
    const session = await AIChatSession.findOne({
      sessionId,
      userId: user._id,
      isActive: true
    });

    if (!session) {
      res.status(404).json({ message: "Chat session bulunamadı" });
      return;
    }

    // Kullanıcı mesajını ekle
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // AI yanıtını al
    let aiResponse = "";
    try {
      // Konuşma geçmişini hazırla (son 10 mesaj)
      const conversationHistory = session.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Koç türüne göre farklı AI fonksiyonlarını kullan
      if (session.coachType && session.coachType !== "general" && session.coachId) {
        // Yaşam koçu ile sohbet - Google AI kullan
        const aiResult = await chatWithGoogleLifeCoach({
          message,
          coachId: session.coachId,
          conversationHistory
        });
        aiResponse = aiResult.response;
      } else {
        // Genel AI sohbet - Google AI kullan
        const aiResult = await chatWithGoogleAI({
          message,
          conversationHistory
        });
        aiResponse = aiResult.response;
      }
    } catch (aiError) {
      console.error("AI yanıt hatası:", aiError);
      aiResponse = "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
    }

    // AI yanıtını ekle
    session.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Session'ı güncelle
    session.updatedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        message: {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
        messageCount: session.messages.length,
        coachType: session.coachType,
        coachId: session.coachId,
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export const sendMessageStream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { sessionId, message } = req.body;

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

    if (!sessionId || !message) {
      res.status(400).json({ message: "Session ID ve mesaj gereklidir" });
      return;
    }

    // Session'ı bul
    const session = await AIChatSession.findOne({
      sessionId,
      userId: user._id,
      isActive: true
    });

    if (!session) {
      res.status(404).json({ message: "Chat session bulunamadı" });
      return;
    }

    // Kullanıcı mesajını ekle
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Streaming response için headers ayarla
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullResponse = "";

    try {
      // Konuşma geçmişini hazırla (son 10 mesaj)
      const conversationHistory = session.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Koç türüne göre farklı AI fonksiyonlarını kullan
      if (session.coachType && session.coachType !== "general" && session.coachId) {
        // Yaşam koçu ile streaming sohbet
        for await (const chunk of chatWithGoogleLifeCoachStream({
          message,
          coachId: session.coachId,
          conversationHistory
        })) {
          fullResponse += chunk;
          res.write(chunk);
        }
      } else {
        // Genel AI streaming sohbet
        for await (const chunk of chatWithGoogleAIStream({
          message,
          conversationHistory
        })) {
          fullResponse += chunk;
          res.write(chunk);
        }
      }
    } catch (aiError) {
      console.error("AI streaming yanıt hatası:", aiError);
      const errorMessage = "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
      fullResponse = errorMessage;
      res.write(errorMessage);
    }

    // AI yanıtını session'a ekle
    session.messages.push({
      role: "assistant",
      content: fullResponse,
      timestamp: new Date(),
    });

    // Session'ı güncelle
    session.updatedAt = new Date();
    await session.save();

    res.end();
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
