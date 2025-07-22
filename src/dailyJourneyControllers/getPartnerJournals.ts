import { Request, Response } from "express";
import { DailyJournal } from "../Models/dailyJournal";
import { User } from "../Models/user";
import jwt from "jsonwebtoken";

const getPartnerJournalsController = async (req: Request, res: Response) => {
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

    const user = await User.findById(decodedToken.id);
    if (!user || !user.partnerId) {
      console.log("user not found");
      res.status(400).json({ message: "Partner bulunamadı" });
      return;
    }

    const { page = 1, limit = 10, sort = "desc" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const journals = await DailyJournal.find({
      user: user.partnerId,
      isPrivate: false, // Sadece public günlükleri getir
    })
      .sort({ date: sort === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("photos", "url")
      .exec();

    const total = await DailyJournal.countDocuments({
      user: user.partnerId,
      isPrivate: false,
    });

    res.status(200).json({
      message: "Partner günlükleri başarıyla getirildi",
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
    res.status(400).json({ message: "Partner günlükleri getirilemedi" });
  }
};

export default getPartnerJournalsController;
