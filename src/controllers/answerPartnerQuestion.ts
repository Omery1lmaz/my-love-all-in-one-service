import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError, NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";
import { askAIQuestionAnalysis, main } from "../utils/aiClient";

export const answerPartnerQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const { id } = req.params
  const { answer } = req.body;
  console.log("answer partner question", id, answer)
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
    const partner = await User.findById(user.partnerId)

    if (!partner) {
      next(new BadRequestError("Partner not found"))
      return
    }

    if (!partner?.questions) {
      next(new BadRequestError("Partner hase not any question"))
      return
    }

    console.log(partner.questions, "partner questions")
    const questionIndex = partner.questions.findIndex((question: any) => {
      const t = (question._id as mongoose.Types.ObjectId).toString() == id
      console.log(t, "t deneme")
      return t
    })
    if (questionIndex === -1) {
      next(new BadRequestError("Question not found"))
      return
    }
    partner.questions[questionIndex].partnerAnswer = answer;
    partner.save();
    try {
      // const airesponse = await main()
      const airesponse = await askAIQuestionAnalysis({
        partnerAnswer: partner.questions[questionIndex].partnerAnswer,
        question: partner.questions[questionIndex].question,
        userAnswer: partner.questions[questionIndex].answer
      })
      if (airesponse.status == "success") {
        partner.questions[questionIndex].aiMessage = airesponse.yorum;
        partner.questions[questionIndex].aiScore = Number(airesponse.puan) || 0;
        partner.questions[questionIndex].aiSuggestion = airesponse.tavsiye;
        partner.save()
      }
      console.log(airesponse, "ai response")
    } catch (error) {
      console.log(error, "error test deneme")

    }
    res.status(200).json({
      message: "Cevap güncellendi",
      status: "success",
      statusCode: 200,
      data: partner?.questions || [],
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default answerPartnerQuestionController;
