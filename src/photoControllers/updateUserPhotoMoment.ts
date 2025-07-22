import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError, NotFoundError } from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
import { Photo } from "../Models/photo";

export const updateUserPhotoMoment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const { moment = "" } = req.body;
    console.log(moment, "moment");
    console.log("updateUserPhotoMoment authHeader", authHeader);
    if (!authHeader) {
      console.log("updateUserPhotoMoment authHeader");
      next(new NotAuthorizedError());
      return;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      console.log("updateUserPhotoMoment token");
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
        partnerId?: string;
      };
    } catch (err) {
      console.log("updateUserPhotoMoment err", err);
      next(new NotAuthorizedError());
      return;
    }

    if (!decodedToken?.id) {
      console.log("updateUserPhotoMoment decodedToken?.id");
      next(new NotAuthorizedError());
      return;
    }

    const photo = await Photo.findOne({
      _id: req.params.photoId,
      user: decodedToken.id || decodedToken.partnerId,
    });
    console.log("updateUserPhotoMoment photo", photo);
    if (!photo) {
      console.log("updateUserPhotoMoment photo", photo);
      next(new NotFoundError());
      return;
    }
    if (photo.user.toString() == decodedToken.id) {
      photo.moment.me.description = moment;
    } else if (photo.user.toString() == decodedToken.partnerId) {
      photo.moment.partner.description = moment;
    } else {
      next(new NotFoundError());
      return;
    }
    await photo.save();
    res.status(200).json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ message: "Error fetching photo" });
  }
};

export default updateUserPhotoMoment;
