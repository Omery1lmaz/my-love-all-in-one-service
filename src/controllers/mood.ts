import { Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";

export const addMoodEntry = async (req: Request, res: Response) => {
  const { mood, note } = req.body;
  const user = await User.findById(req.currentUser!.id);

  if (!user) {
    throw new NotFoundError();
  }

  user.moodHistory = user.moodHistory || [];
  user.moodHistory.push({
    date: new Date(),
    mood,
    note,
  });

  await user.save();
  res.status(200).json({
    message: "Mood entry added successfully",
    status: "success",
    statusCode: 200,
    data: user,
  });
};
