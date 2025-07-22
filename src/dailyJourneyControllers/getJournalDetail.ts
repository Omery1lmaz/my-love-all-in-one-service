import { Request, Response } from "express";
import { DailyJournal } from "../Models/dailyJournal";
import { User } from "../Models/user";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getJournalDetailController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const { id } = req.params;

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

    // Günlüğü bul ve kullanıcı veya partner kontrolü yap
    const journal = await DailyJournal.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [
        { user: user._id }, // Kullanıcının kendi günlüğü
        {
          user: user.partnerId, // Partner'ın günlüğü
          isPrivate: false, // Ama private olmayan
        },
      ],
    }).populate("photos", "url");

    if (!journal) {
      res.status(404).json({ message: "Günlük bulunamadı" });
      return;
    }

    res.status(200).json({
      message: "Günlük detayı başarıyla getirildi",
      status: "success",
      statusCode: 200,
      data: journal,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Günlük detayı getirilemedi" });
  }
};

export default getJournalDetailController;
