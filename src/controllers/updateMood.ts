import { Request, Response } from "express";
import { User } from "../Models/user";
import jwt from "jsonwebtoken";

const updateMoodController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  const { mood, note, activities } = req.body;
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
    user.moodHistory = user.moodHistory || [];
    user.moodHistory.push({
      date: new Date(),
      mood,
      note,
      activities,
    });

    await user.save();

    res.status(200).json({
      message: "Mood başarıyla güncellendi",
      status: "success",
      statusCode: 200,
      data: user.moodHistory,
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateMoodController;
