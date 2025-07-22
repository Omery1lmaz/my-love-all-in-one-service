import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const getUserQuestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const { questions } = req.body;
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
      next(new BadRequestError("User not found"))
      return
    }

    // const partner = await User.findById(user.partnerId)

    // if (!partner) {
    //   next(new BadRequestError("Partner not found"))
    //   return
    // }
    res.status(200).json({
      message: "Sorular güncellendi",
      status: "success",
      statusCode: 200,
      data: user.questions || [],
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default getUserQuestionsController;
