import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotAuthorizedError, NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";
import { Photo } from "../Models/photo";
import { natsWrapper } from "../nats-wrapper";
import sharp from "sharp";
import { uploadToS3 } from "../utils/upload";
import { Event } from "../Models/event";

const uploadMultiPhotoEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Return type is Promise<void>
  try {
    console.log("uploadMultiPhotoEventController");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("NotAuthorizedError")
      next(new NotAuthorizedError());
      return;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
      };
    } catch (err) {
      console.log("NotAuthorizedError")
      next(new NotAuthorizedError());
      return;
    }

    if (!decodedToken?.id) {
      console.log("NotAuthorizedError")
      next(new NotAuthorizedError());
      return;
    }
    console.log("req.files", req.files);
    if (!req.files || !Array.isArray(req.files)) {
      console.log("BadRequestError")
      next(new BadRequestError("File upload failed"));
      return;
    }

    const {
      description = "",
      tags = [],
      musicUrl = "",
      note = "",
      location,
      coverPhotoFileName,
      eventId,
    } = req.body;
    console.log("coverPhotoFileName", coverPhotoFileName);
    const uploadedPhotos = [];
    let coverPhotoId = null;
    for (const file of req.files) {
      console.log("file", file);

      const fileName = `${Date.now()}-${file.originalname}`;
      const thumbnailName = `thumb-${fileName}`;

      // Upload original and thumbnail to S3
      const [originalUrl, thumbnailUrl] = await Promise.all([
        uploadToS3(file.buffer, fileName, file.mimetype),
        sharp(file.buffer).resize({ width: 300 }).toBuffer().then((thumbBuffer: any) =>
          uploadToS3(thumbBuffer, thumbnailName, file.mimetype)
        ),
      ]);

      let locationData = null;
      if (location) {
        locationData = JSON.parse(location);
      }

      const newPhoto = new Photo({
        user: new mongoose.Types.ObjectId(),
        event: eventId,
        url: originalUrl,
        thumbnailUrl,
        tags,
        musicUrl,
        note,
        location: locationData,
        isPrivate: false,
      });

      const savedPhoto = await newPhoto.save();
      uploadedPhotos.push(savedPhoto);
      if (coverPhotoFileName === file.originalname) {
        console.log(
          "coverPhotoFileName",
          coverPhotoFileName,
          file.originalname
        );
        coverPhotoId = savedPhoto._id;
      }
    }
    const existsEvent = await Event.findById(eventId);
    if (!existsEvent) {
      console.log("Event not found");
      next(new NotFoundError());
      return;
    }
    existsEvent.photos = uploadedPhotos.map((photo: any) => photo._id);
    await existsEvent.save();
    console.log("cover photo id", coverPhotoId);
    res.status(201).json({
      message: "Photos uploaded successfully",
      uploadedPhotos: uploadedPhotos || [],
      coverPhotoId: coverPhotoId || null,
    });
  } catch (error) {
    console.error("Error creating photo:", error);
    next(new BadRequestError("Internal server error"));
    return;
  }
};

export default uploadMultiPhotoEventController;
