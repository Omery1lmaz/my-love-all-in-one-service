import { Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";

export const getRelationshipStats = async (req: Request, res: Response) => {
  const user = await User.findById(req.currentUser!.id);

  if (!user || !user.relationshipStartDate) {
    throw new NotFoundError();
  }

  const now = new Date();
  const startDate = new Date(user.relationshipStartDate);
  const daysTogether = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const stats = {
    daysTogether,
    moodHistory: user.moodHistory || [],
    timelineEvents: user.relationshipTimeline || [],
    activeReminders: (user.reminders || []).filter((r) => !r.isCompleted),
    journalEntries: (user.dailyJournal || []).filter((j) => !j.isPrivate),
    quizResults: user.relationshipQuizzes || [],
  };

  res.status(200).json({
    message: "Relationship stats fetched successfully",
    status: "success",
    statusCode: 200,
    data: stats,
  });
};
