import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError, NotFoundError } from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
import { Photo } from "../Models/photo";

export const getPhotoByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("getPhotoByIdController authHeader", authHeader);
    if (!authHeader) {
      console.log("getPhotoByIdController authHeader");
      next(new NotAuthorizedError());
      return;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      console.log("getPhotoByIdController token");
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
      };
    } catch (err) {
      console.log("getPhotoByIdController err", err);
      next(new NotAuthorizedError());
      return;
    }

    if (!decodedToken?.id) {
      console.log("getPhotoByIdController decodedToken?.id");
      next(new NotAuthorizedError());
      return;
    }

    const photo = await Photo.findOne({
      _id: req.params.photoId,
      user: decodedToken.id,
    });
    console.log("getPhotoByIdController photo", photo);
    if (!photo) {
      next(new NotFoundError());
      return;
    }

    res.status(200).json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ message: "Error fetching photo" });
  }
};

export default getPhotoByIdController;
