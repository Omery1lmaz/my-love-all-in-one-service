import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const updateUserQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const { question } = req.body;
  const { id } = req.params;
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
    console.log(decodedToken, "decoded token");
    const user = await User.findById(
      new mongoose.Types.ObjectId(decodedToken.id)
    );
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    if (!user.questions) {
      next(new NotFoundError())
      return;
    }
    const existQuestion = user.questions?.findIndex((i: any) => i._id)

    if (existQuestion) {
      user.questions[existQuestion].question = question.question
      user.questions[existQuestion].userScore = question.userScore
    }
    await user.save();
    console.log(user.hobbies, "user.hobbies");
    res.status(200).json({
      message: "Question güncellendi",
      status: "success",
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateUserQuestionController;
