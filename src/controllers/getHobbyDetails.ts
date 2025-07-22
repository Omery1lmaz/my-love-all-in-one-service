import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
export const getHobbyDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log("hobby id", id);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("no authHeader");
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
        console.log("no user");
        next(new NotAuthorizedError());
        return;
      }
      if (!user.hobbies || user.hobbies.length === 0) {
        console.log("no hobbies");
        next(new BadRequestError("Hobbies not found."));
        return;
      }
      const hobbyIndex = user.hobbies.findIndex(
        (item) => (item as any)._id.toString() === id
      );

      if (hobbyIndex === -1) {
        console.log("no hobbies 1" );
        next(new BadRequestError("Hobby not found."));
        return;
      }
      res
        .status(200)
        .send({ message: "Today's song has been set.", data: user.hobbies[hobbyIndex] });
    } catch (error) {
      console.log("errror", error);
      next(new NotAuthorizedError());
      return;
    }
  } catch (err) {
    console.error(err);
    next(new BadRequestError("An unexpected error occurred."));
  }
};
