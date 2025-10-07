import { Request, Response, NextFunction } from "express";
import { analyzeTextWithGoogleAI } from "../utils/aiClient";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const analyzeText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { text, analysisType, targetLanguage } = req.body;

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

    if (!text) {
      res.status(400).json({ message: "Analiz edilecek metin gereklidir" });
      return;
    }

    // Google AI ile metin analizi
    const analysisResult = await analyzeTextWithGoogleAI({
      text,
      analysisType: analysisType || 'summary',
      targetLanguage: targetLanguage || 'tr'
    });

    if (analysisResult.status === "error") {
      res.status(500).json({ 
        message: "Metin analizi başarısız", 
        error: analysisResult.error 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        originalText: text,
        analysisType: analysisType || 'summary',
        result: analysisResult.result,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
