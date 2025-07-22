import { Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";

export const addReminder = async (req: Request, res: Response) => {
  const { title, date, description } = req.body;
  const user = await User.findById(req.currentUser!.id);

  if (!user) {
    throw new NotFoundError();
  }

  user.reminders = user.reminders || [];
  user.reminders.push({
    title,
    date: new Date(date),
    description,
    isCompleted: false,
  });

  await user.save();
  res.status(200).json({
    message: "Reminder added successfully",
    status: "success",
    statusCode: 200,
    data: user,
  });
};
