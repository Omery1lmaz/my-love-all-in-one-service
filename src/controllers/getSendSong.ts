import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
export const getSendSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Lütfen giriş yapın" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(400).json({ message: "Token bulunamadı" });
      return;
    }
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
      };
      const user = await User.findById(decodedToken.id);
      if (!user) {
        next(new NotAuthorizedError());
        return;
      }
      const songs = user.sendedMusic  

     
      await user.save();
      res
        .status(200)
        .send({ message: "Today's song has been set.", songs: songs });
    } catch (error) {
      next(new NotAuthorizedError());
      return;
    }
  } catch (err) {
    console.error(err);
    next(new BadRequestError("An unexpected error occurred."));
  }
};
