import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import { Timeline } from "../Models/timeline";
import mongoose from "mongoose";
import { Subscription } from "../Models/subscription";

export const createTimelineController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };
    console.log(decoded.id, "decoded")
    const users = await User.find()
    const user = await User.findById(decoded.id);
    console.log("users", users)
    if (!user) {
      console.log("user not found");
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Ensure user has a subscription (create default if not exists)
    console.log(`Ensuring subscription exists for timeline creation - user: ${decoded.id}`);
    let userSubscription;
    try {
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(decoded.id)
      );
      console.log(`Subscription verified/created for timeline creation - user: ${decoded.id}`, {
        subscriptionId: userSubscription._id,
        planType: userSubscription.planType,
        isActive: userSubscription.isActive
      });
      
      // Double check that subscription is active
      if (!userSubscription.isActive) {
        console.warn(`Subscription found but inactive for user: ${decoded.id}, activating...`);
        userSubscription.isActive = true;
        await userSubscription.save();
        console.log(`Subscription activated for user: ${decoded.id}`);
      }
    } catch (error) {
      console.error(`Error with subscription for timeline creation - user ${decoded.id}:`, error);
      res.status(400).json({ message: "Subscription doğrulanamadı" });
      return;
    }

    // Check if user can create more timeline events (basic check)
    const existingTimelines = await Timeline.countDocuments({ userId: decoded.id });
    console.log(`Timeline count check for user: ${decoded.id}`, {
      existingTimelines,
      planType: userSubscription.planType
    });

    // Basic timeline limit check (can be enhanced based on plan)
    const maxTimelines = userSubscription.planType === 'free' ? 20 : 
                        userSubscription.planType === 'premium' ? 100 : 500;
    
    if (existingTimelines >= maxTimelines) {
      console.error(`Timeline limit exceeded for user: ${decoded.id}`, {
        existingTimelines,
        maxTimelines,
        planType: userSubscription.planType
      });
      res.status(400).json({ 
        message: `Timeline limiti aşıldı. Mevcut planınızla ${maxTimelines} timeline oluşturabilirsiniz.` 
      });
      return;
    }

    console.log(`Timeline creation allowed for user: ${decoded.id}`, {
      existingTimelines,
      maxTimelines,
      planType: userSubscription.planType
    });

    const {
      title,
      description,
      date,
      type,
      isPrivate,
      icon
    }: {
      title: string;
      description: string;
      date: string;
      type:
      | "anniversary"
      | "first_meet"
      | "first_date"
      | "special_moment"
      | "custom";
      isPrivate: boolean;
      icon: string;
    } = req.body;

    const timelineEvent = Timeline.build({
      userId: user.id,
      partnerId: user.partnerId as unknown as mongoose.Types.ObjectId,
      title,
      description,
      date: new Date(date),
      type,
      photos: [],
      coverPhotoId: undefined,
      isPrivate,
      icon
    });

    console.log(`Saving timeline event for user: ${decoded.id}`);
    await timelineEvent.save();

    console.log(`Timeline event created successfully for user: ${decoded.id}`, {
      timelineId: timelineEvent._id,
      timelineTitle: timelineEvent.title,
      planType: userSubscription.planType,
      remainingTimelines: maxTimelines - (existingTimelines + 1)
    });

    res.status(201).json({
      message: "Timeline event created successfully",
      status: "success",
      statusCode: 201,
      data: timelineEvent,
      subscriptionInfo: {
        planType: userSubscription.planType,
        remainingTimelines: maxTimelines - (existingTimelines + 1),
        maxTimelines: maxTimelines
      }
    });
  } catch (error) {
    console.error("Error creating timeline event:", error);
    res.status(500).json({ message: "Error creating timeline event" });
  }
};

export default createTimelineController;
