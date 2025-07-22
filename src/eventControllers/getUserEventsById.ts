import { Request, Response } from "express";
import { Event } from "../Models/event";
import jwt from "jsonwebtoken";

const getUserEventsByIdController = async (req: Request, res: Response) => {
  console.log("getUserEventsByIdController");
  const authHeader = req.headers.authorization;
  const { id } = req.params;

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
    const event = await Event.findOne({
      $or: [
        { userId: decodedToken.id, _id: id },
        { partnerId: decodedToken.id, _id: id },
      ],
    })
      .populate("photos")
      .populate("coverPhotoId");

    if (!event) {
      res.status(400).json({ message: "Event bulunamadı" });
      return;
    }

    res.status(201).json({
      message: "Event başarıyla alındı",
      status: "success",
      statusCode: 201,
      data: event,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Event alınamadı" });
  }
};

export default getUserEventsByIdController;
