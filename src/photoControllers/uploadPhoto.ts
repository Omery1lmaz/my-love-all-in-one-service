import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
import { Photo } from "../Models/photo";
import sharp from "sharp";
import { uploadToS3 } from "../utils/upload";
import { StorageService } from "../services/storageService";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";

export const uploadPhotoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("uploadPhotoController");
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
        return;
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

      // Safe JSON parsing with proper error handling
      const parsedTags =
        tags && tags !== ""
          ? (() => {
              try {
                return JSON.parse(tags);
              } catch {
                return [];
              }
            })()
          : [];

      const parsedLocation =
        location && location !== ""
          ? (() => {
              try {
                return JSON.parse(location);
              } catch {
                return null;
              }
            })()
          : null;

      const parsedDate =
        photoDate && !isNaN(new Date(photoDate).getTime())
          ? new Date(photoDate)
          : new Date();

      const parsedIsPrivate =
        typeof isPrivate === "string"
          ? (() => {
              try {
                return JSON.parse(isPrivate);
              } catch {
                return false;
              }
            })()
          : isPrivate;

      const parsedMusicDetails =
        musicDetails && musicDetails !== ""
          ? (() => {
              try {
                return JSON.parse(musicDetails);
              } catch {
                return null;
              }
            })()
          : null;

      const file = req.file;
      console.log(photoDate, "photoDate");

      // Check storage limits before upload
      const canUpload = await StorageService.canUploadPhoto(
        new mongoose.Schema.Types.ObjectId(decodedToken.id),
        file.size
      );
      if (!canUpload.canUpload) {
        return next(
          new BadRequestError(canUpload.reason || "Upload not allowed")
        );
      }

      // Ensure user has a subscription (create default if not exists)
      await Subscription.getDefaultSubscription(
        new mongoose.Schema.Types.ObjectId(decodedToken.id)
      );

      // S3 için isim üret
      const fileName = `${Date.now()}-${file.originalname}`;
      const thumbnailName = `thumb-${fileName}`;

      // Orijinal ve Thumbnail oluştur
      const [originalUrl, thumbnailUrl] = await Promise.all([
        uploadToS3(file.buffer, fileName, file.mimetype),
        sharp(file.buffer)
          .resize({ width: 300 })
          .toBuffer()
          .then((thumbBuffer: any) =>
            uploadToS3(thumbBuffer, thumbnailName, file.mimetype)
          ),
      ]);
      console.log(originalUrl, thumbnailUrl, "originalUrl, thumbnailUrl");
      // Extract image dimensions using sharp
      const imageMetadata = await sharp(file.buffer).metadata();

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
        fileSize: file.size,
        originalName: file.originalname,
        mimeType: file.mimetype,
        width: imageMetadata.width,
        height: imageMetadata.height,
      });

      const savedPhoto = await newPhoto.save();

      // Update user's storage usage after successful upload
      await StorageService.updateUserStorage(
        new mongoose.Schema.Types.ObjectId(decodedToken.id)
      );

      // Get updated storage info for response
      const storageInfo = await StorageService.getUserStorageInfo(
        new mongoose.Schema.Types.ObjectId(decodedToken.id)
      );

      res.status(201).json({
        message: "Photo created successfully",
        imageUrl: originalUrl,
        thumbnailUrl,
        photo: savedPhoto,
        storageInfo: {
          usedStorage: StorageService.formatBytes(
            storageInfo.storageUsage.totalStorageUsed
          ),
          totalStorage: StorageService.formatBytes(
            storageInfo.subscription.storageLimit
          ),
          usedPhotos: storageInfo.storageUsage.photosCount,
          maxPhotos: storageInfo.subscription.maxPhotos,
          storagePercentage: storageInfo.storagePercentage.toFixed(1),
          photosPercentage: storageInfo.photosPercentage.toFixed(1),
          planType: storageInfo.subscription.planType,
        },
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
