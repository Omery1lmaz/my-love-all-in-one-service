import { Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";

export const addJournalEntry = async (req: Request, res: Response) => {
  const { content, isPrivate } = req.body;
  const user = await User.findById(req.currentUser!.id);

  if (!user) {
    throw new NotFoundError();
  }

  user.dailyJournal = user.dailyJournal || [];
  user.dailyJournal.push({
    date: new Date(),
    content,
    isPrivate: isPrivate || false,
  });

  await user.save();
  res.status(200).send(user);
};
