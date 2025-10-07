import { Request, Response, NextFunction } from "express";
import { analyzeImageWithGoogleAI } from "../utils/aiClient";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const analyzeImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { imageUrl, prompt } = req.body;

  if (!authHeader) {
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
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

    if (!imageUrl) {
      res.status(400).json({ message: "Analiz edilecek görsel URL'si gereklidir" });
      return;
    }

    // Google AI ile görsel analizi
    const analysisResult = await analyzeImageWithGoogleAI({
      imageUrl,
      prompt: prompt || "Bu görselde ne görüyorsun? Detaylı olarak açıkla."
    });

    if (analysisResult.status === "error") {
      res.status(500).json({ 
        message: "Görsel analizi başarısız", 
        error: analysisResult.error 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        imageUrl,
        prompt: prompt || "Bu görselde ne görüyorsun? Detaylı olarak açıkla.",
        result: analysisResult.result,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
