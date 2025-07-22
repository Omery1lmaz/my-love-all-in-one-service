import { NextFunction, Request, Response } from "express";
import { BookAttrs, Hobby, User } from "../Models/user";
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
interface BookResponse {
  me: BookAttrs[];
  partner: BookAttrs[];
}

export const getBooksController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
      let books: BookResponse = {
        me: user.books || [],
        partner: [],
      };
    const partner = await User.findOne({
        _id: user.partnerId,
        partnerId: user._id,
      });
      if (partner) {
        books.partner = partner.books?.filter((hobby) => hobby.sharedWithPartner) || [];
      }
      res
        .status(200)
        .send({ message: "Today's song has been set.", books: books });
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
