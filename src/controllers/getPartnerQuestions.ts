import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError, NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const getPartnerQuestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
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

    if (!user || !user.partnerId) {
      next(new NotFoundError())
      return
    }
    const partner = await User.findById(user.partnerId)
    console.log("partner questions test ", partner?.questions)
    res.status(200).json({
      message: "Sorular güncellendi",
      status: "success",
      statusCode: 200,
      data: partner?.questions || [],
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default getPartnerQuestionsController;
