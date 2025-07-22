import { Request, Response } from "express";
import { DailyJournal } from "../Models/dailyJournal";
import jwt from "jsonwebtoken";

const getUserJournalsController = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  console.log("get user journals")
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


    const { page = 1, limit = 10, sort = "desc" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    console.log(decodedToken.id, "decoded token id")
    const journals = await DailyJournal.find({ user: decodedToken.id })
      .sort({ date: sort === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("photos", "url")
      .exec();
    console.log("journals test", journals)
    const total = await DailyJournal.countDocuments({ user: decodedToken.id });

    res.status(200).json({
      message: "Günlükler başarıyla getirildi",
      status: "success",
      statusCode: 200,
      data: {
        journals,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Günlükler getirilemedi" });
  }
};

export default getUserJournalsController;
