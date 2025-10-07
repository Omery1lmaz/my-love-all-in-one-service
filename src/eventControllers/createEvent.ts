import { Request, Response } from "express";
import { Event } from "../Models/event";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../Models/user";
import { natsWrapper } from "../nats-wrapper";
import { Subscription } from "../Models/subscription";
import { LovePointsService } from "../services/lovePointsService";

const createEventController = async (req: Request, res: Response) => {
  console.log("createEventController");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("authHeader not found");
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("token not found");
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };

    const {
      title,
      description,
      eventType,
      customEventType,
      startDate,
      endDate,
      startTime,
      endTime,
      isAllDay,
      isRecurring,
      recurrence,
      location,
      mood,
      surpriseLevel,
      giftIdeas,
      photos,
      notes,
      budget,
      weatherDependent,
      weatherPreferences,
      isPrivate,
      memories,
    } = req.body;
    const user = await User.findById(decodedToken.id)
    if (!user) {
      console.log("user not found");
      res.status(400).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    // Ensure user has a subscription (create default if not exists)
    console.log(`Ensuring subscription exists for event creation - user: ${decodedToken.id}`);
    let userSubscription;
    try {
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(decodedToken.id)
      );
      console.log(`Subscription verified/created for event creation - user: ${decodedToken.id}`, {
        subscriptionId: userSubscription._id,
        planType: userSubscription.planType,
        isActive: userSubscription.isActive
      });
      
      // Double check that subscription is active
      if (!userSubscription.isActive) {
        console.warn(`Subscription found but inactive for user: ${decodedToken.id}, activating...`);
        userSubscription.isActive = true;
        await userSubscription.save();
        console.log(`Subscription activated for user: ${decodedToken.id}`);
      }
    } catch (error) {
      console.error(`Error with subscription for event creation - user ${decodedToken.id}:`, error);
      res.status(400).json({ message: "Subscription doğrulanamadı" });
      return;
    }

    // Check if user can create more events (basic check)
    const existingEvents = await Event.countDocuments({ userId: decodedToken.id });
    console.log(`Event count check for user: ${decodedToken.id}`, {
      existingEvents,
      planType: userSubscription.planType
    });

    // Basic event limit check (can be enhanced based on plan)
    const maxEvents = userSubscription.planType === 'free' ? 10 : 
                     userSubscription.planType === 'premium' ? 100 : 500;
    
    if (existingEvents >= maxEvents) {
      console.error(`Event limit exceeded for user: ${decodedToken.id}`, {
        existingEvents,
        maxEvents,
        planType: userSubscription.planType
      });
      res.status(400).json({ 
        message: `Etkinlik limiti aşıldı. Mevcut planınızla ${maxEvents} etkinlik oluşturabilirsiniz.` 
      });
      return;
    }

    console.log(`Event creation allowed for user: ${decodedToken.id}`, {
      existingEvents,
      maxEvents,
      planType: userSubscription.planType
    });

    const event = new Event({
      userId: decodedToken.id,
      partnerId: user.partnerId || null,
      title,
      description,
      eventType,
      customEventType,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      startTime,
      endTime,
      isAllDay,
      isRecurring,
      recurrence,
      location,
      mood,
      surpriseLevel,
      giftIdeas,
      // photos,
      notes,
      budget,
      weatherDependent,
      weatherPreferences,
      isPrivate: isPrivate || false,
      memories,
    });

    console.log(`Saving event for user: ${decodedToken.id}`);
    await event.save();

    // Add LovePoints for event creation
    const pointsResult = await LovePointsService.addPoints(
      decodedToken.id, 
      "event_create", 
      { eventId: event._id, eventType: eventType }
    );

    console.log(`Event created successfully for user: ${decodedToken.id}`, {
      eventId: event._id,
      eventTitle: event.title,
      planType: userSubscription.planType,
      remainingEvents: maxEvents - (existingEvents + 1),
      pointsAdded: pointsResult.userLevel?.pointsAdded || 0,
      newAchievements: pointsResult.newAchievements?.length || 0,
      leveledUp: pointsResult.levelUp?.leveledUp || false
    });

    res.status(201).json({
      message: "Event başarıyla oluşturuldu",
      status: "success",
      statusCode: 201,
      data: event,
      subscriptionInfo: {
        planType: userSubscription.planType,
        remainingEvents: maxEvents - (existingEvents + 1),
        maxEvents: maxEvents
      },
      gamification: {
        pointsAdded: pointsResult.userLevel?.pointsAdded || 0,
        newAchievements: pointsResult.newAchievements || [],
        levelUp: pointsResult.levelUp || { leveledUp: false },
        currentLevel: pointsResult.userLevel?.currentLevel || 1,
        currentLevelTitle: pointsResult.userLevel?.currentLevelTitle || "New Flame"
      }
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Event oluşturulamadı" });
  }
};

export default createEventController;
