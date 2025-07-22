import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
import { Photo } from "../Models/photo";
import sharp from "sharp";
import { uploadToS3 } from "../utils/upload";

export const uploadPhotoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return next(new NotAuthorizedError());

      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          title: string;
        };
      } catch {
        next(new NotAuthorizedError());
        return
      }

      if (!decodedToken?.id || !req.file) {
        next(new BadRequestError("File upload failed"));
        return;
      }

      const {
        album,
        description = "",
        tags = [],
        musicUrl = "",
        title = "",
        note = "",
        location,
        musicDetails,
        photoDate = new Date(),
        isPrivate = false,
      } = req.body;

      const parsedTags = tags ? JSON.parse(tags) : [];
      const parsedLocation = location ? JSON.parse(location) : null;
      const parsedDate = photoDate && !isNaN(new Date(photoDate).getTime())
        ? new Date(photoDate)
        : new Date();
      const parsedIsPrivate = typeof isPrivate === "string" ? JSON.parse(isPrivate) : isPrivate;
      const parsedMusicDetails = musicDetails ? JSON.parse(musicDetails) : null;

      const file = req.file;
      console.log(photoDate, "photoDate");
      // S3 için isim üret
      const fileName = `${Date.now()}-${file.originalname}`;
      const thumbnailName = `thumb-${fileName}`;

      // Orijinal ve Thumbnail oluştur
      const [originalUrl, thumbnailUrl] = await Promise.all([
        uploadToS3(file.buffer, fileName, file.mimetype),
        sharp(file.buffer).resize({ width: 300 }).toBuffer().then((thumbBuffer: any) =>
          uploadToS3(thumbBuffer, thumbnailName, file.mimetype)
        ),
      ]);
      console.log(originalUrl, thumbnailUrl, "originalUrl, thumbnailUrl");
      const newPhoto = new Photo({
        user: decodedToken.id,
        album,
        url: originalUrl,
        thumbnailUrl,
        moment: {
          me: {
            description,
          },
          partner: {
            description: "",
          },
        },
        photoDate: parsedDate || new Date(),
        tags: parsedTags,
        musicUrl,
        title,
        note,
        location: parsedLocation,
        musicDetails: parsedMusicDetails,
        isPrivate: parsedIsPrivate,
      });

      const savedPhoto = await newPhoto.save();

      res.status(201).json({
        message: "Photo created successfully",
        imageUrl: originalUrl,
        thumbnailUrl,
        photo: savedPhoto,
      });
    } catch (error) {
      console.error("Error creating photo:", error);
      next(new BadRequestError("Internal server error"));
      return;
    }
  } catch (error) {
    console.error("Error creating photo:", error);
    next(new BadRequestError("Internal server error"));
    return;

  }
};
export default uploadPhotoController;
