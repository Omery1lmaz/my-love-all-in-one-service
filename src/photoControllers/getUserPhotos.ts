import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
import { Photo } from "../Models/photo";

export const getUserPhotosController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getUserPhotosController");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("getUserPhotosController authHeader");
      next(new NotAuthorizedError());
      return;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      console.log("getUserPhotosController token");
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
      };
    } catch (err) {
      console.log("getUserPhotosController err");
      next(new NotAuthorizedError());
      return;
    }
    console.log("getUserPhotosController decodedToken", decodedToken.id);
    if (!decodedToken?.id) {
      console.log("getUserPhotosController decodedToken?.id");
      next(new NotAuthorizedError());
      return;
    }

    const photos = await Photo.find({ user: decodedToken.id });
    console.log("getUserPhotosController photos", photos);
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching user photos:", error);
    res.status(500).json({ message: "Error fetching photos" });
  }
};

export default getUserPhotosController;
