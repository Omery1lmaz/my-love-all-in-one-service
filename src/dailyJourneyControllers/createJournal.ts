import { Request, Response } from "express";
import { DailyJournal } from "../Models/dailyJournal";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../Models/user";

const createJournalController = async (req: Request, res: Response) => {
  console.log("createJournalController");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("authHeader not found");
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("token not found");
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };

    const { title, content, mood, isPrivate, tags, weather } = req.body;
    const user = await User.findById(decodedToken.id);
    if (!user) {
      console.log("user not found create journal");
      res.status(400).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    const journal = new DailyJournal({
      user: decodedToken.id,
      date: new Date(),
      title,
      content,
      mood,
      partner: user.partnerId,
      isPrivate,
      tags,
      weather,
    });

    await journal.save();

    res.status(201).json({
      message: "Günlük başarıyla oluşturuldu",
      status: "success",
      statusCode: 201,
      data: journal,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Günlük oluşturulamadı" });
  }
};

export default createJournalController;
