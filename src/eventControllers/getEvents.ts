import { Request, Response } from "express";
import { Event } from "../Models/event";
import jwt from "jsonwebtoken";

const getEventsController = async (req: Request, res: Response) => {
  console.log("getEventsController");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("authHeader not found");
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log(token);
  if (!token) {
    console.log("token not found");
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };
    console.log(decodedToken);
    const events = await Event.find({
      $or: [{ userId: decodedToken.id }, { partnerId: decodedToken.id }],
    })
      .populate("photos")
      .populate("coverPhotoId");
    console.log("events", events)
    if (!events) {
      console.log("events not found");
      res.status(400).json({ message: "Eventler bulunamadı" });
      return;
    }

    res.status(201).json({
      message: "Eventler başarıyla alındı",
      status: "success",
      statusCode: 201,
      data: events,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Eventler alınamadı" });
  }
};

export default getEventsController;
