import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError, NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const updateQuestionScoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const { id } = req.params;
  const { score, message } = req.body;
  console.log("update question score", score, message, id)
  if (!authHeader) {
    
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
    if (!user.questions) {
      next(new BadRequestError("User has not any question"))
      return
    }
    const questionIndex = user.questions.findIndex((question: any) => {
      const t = (question._id as mongoose.Types.ObjectId).toString() == id
      console.log(t, "t deneme")
      return t
    })
    if (questionIndex === -1) {
      next(new BadRequestError("Question not found"))
      return
    }
    user.questions[questionIndex].userScore = Number(score);
    user.questions[questionIndex].userMessage = message;
    user.save();
    res.status(200).json({
      message: "Cevap güncellendi",
      status: "success",
      statusCode: 200,
      data: user?.questions || [],
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateQuestionScoreController;
