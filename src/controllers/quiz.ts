import { Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";

export const addQuizResult = async (req: Request, res: Response) => {
  const { questions, score } = req.body;
  const user = await User.findById(req.currentUser!.id);

  if (!user) {
    throw new NotFoundError();
  }

  user.relationshipQuizzes = user.relationshipQuizzes || [];
  user.relationshipQuizzes.push({
    date: new Date(),
    questions,
    score,
  });

  await user.save();
  res.status(200).json({
    message: "Quiz result added successfully",
    status: "success",
    statusCode: 200,
    data: user,
  });
};
