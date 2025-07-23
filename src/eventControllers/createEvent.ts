import { Request, Response } from "express";
import { Event } from "../Models/event";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../Models/user";
import { natsWrapper } from "../nats-wrapper";

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

    // if (user) {
    //   const newDocData = user.toObject();
    //   delete (newDocData as { _id?: any })._id;  // ID'yi kaldırıyoruz
    //   await User.findByIdAndDelete("683f5ee84a548d99725f4067");
    //   // Yeni ID'yi verip yeni döküman oluşturuyoruz
    //   const newDoc = new User({ ...newDocData, _id: decodedToken.id });

    //   await newDoc.save();

    //   // Eski dökümanı siliyoruz
    //   const newUser = await User.findByIdAndDelete(decodedToken.id);
    //   console.log("new user", newUser)
    // }

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

    await event.save();

    console.log("event created test t", event)
    res.status(201).json({
      message: "Event başarıyla oluşturuldu",
      status: "success",
      statusCode: 201,
      data: event,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Event oluşturulamadı" });
  }
};

export default createEventController;
