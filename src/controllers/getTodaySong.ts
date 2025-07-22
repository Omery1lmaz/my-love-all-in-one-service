import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/common";
import { v4 as uuidv4 } from "uuid"; // UUID for unique IDs
import jwt from "jsonwebtoken";
export const getTodaySongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("failed autheader")
      res.status(401).json({ message: "Lütfen giriş yapın" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("failed token ")
      res.status(400).json({ message: "Token bulunamadı" });
      return;
    }
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
      };
      const user = await User.findById(decodedToken.id);

      if (!user) {
        console.log("not authorized")
        next(new NotAuthorizedError());
        return;
      }
      // Check if a song is already set for today
      const today = new Date().toISOString().split("T")[0]; // Bugünün tarihini alın (YYYY-MM-DD formatında)

      // Bugünün şarkısını bul
      const todaySong = user.dailySong?.find((song) => {
        const songDate = new Date(song.date).toISOString().split("T")[0];
        return songDate === today; // Tarih bugüne eşitse
      });
      if (!todaySong) {
        next(new BadRequestError("Not found today song"))
        return;
      }
      res.status(200).send({
        message: "Today's song has been set.",
        data: todaySong || null,
      });
    } catch (error) {
      console.log(error, "error test deneme")
      next(new BadRequestError("Something went wrong"));
      return;
    }
  } catch (err) {
    console.error(err);
    next(new BadRequestError("An unexpected error occurred."));
  }
};
