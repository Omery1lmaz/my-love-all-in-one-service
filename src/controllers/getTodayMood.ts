import { Request, Response } from "express";
import { User } from "../Models/user";
import jwt from "jsonwebtoken";

const getTodayMoodController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

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

    const user = await User.findById(decodedToken.id);
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    // Bugünün başlangıcını ve sonunu hesapla
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugünün mood'unu bul
    const todayMood = user.moodHistory?.find((mood) => {
      const moodDate = new Date(mood.date);
      return moodDate >= today && moodDate < tomorrow;
    });

    res.status(200).json({
      message: "Bugünün mood'u başarıyla getirildi",
      status: "success",
      statusCode: 200,
      data: todayMood || null,
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default getTodayMoodController;
