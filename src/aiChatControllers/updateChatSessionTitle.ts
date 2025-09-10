import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const updateChatSessionTitle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { sessionId } = req.params;
  const { title } = req.body;

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

    if (!sessionId || !title) {
      res.status(400).json({ message: "Session ID ve başlık gereklidir" });
      return;
    }

    const session = await AIChatSession.findOne({ 
      sessionId, 
      userId: user._id, 
      isActive: true 
    });

    if (!session) {
      res.status(404).json({ message: "Chat session bulunamadı" });
      return;
    }

    session.title = title;
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        title: session.title,
      },
      message: "Chat session başlığı güncellendi",
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
