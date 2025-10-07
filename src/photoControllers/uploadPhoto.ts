import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
import { Photo } from "../Models/photo";
import sharp from "sharp";
import { uploadToS3 } from "../utils/upload";
import { StorageService } from "../services/storageService";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";
import { LovePointsService } from "../services/lovePointsService";

export const uploadPhotoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let decodedToken: any = null;
  try {
    console.log("uploadPhotoController");
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return next(new NotAuthorizedError());

      const token = authHeader.split(" ")[1];
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

      // Ensure user has a subscription (create default if not exists) - FIRST
      console.log(`Ensuring subscription exists for user: ${decodedToken.id}`);
      let userSubscription;
      try {
        userSubscription = await Subscription.getDefaultSubscription(
          new mongoose.Types.ObjectId(decodedToken.id)
        );
        console.log(`Subscription verified/created for user: ${decodedToken.id}`, {
          subscriptionId: userSubscription._id,
          planType: userSubscription.planType,
          isActive: userSubscription.isActive,
          storageLimit: userSubscription.storageLimit,
          maxPhotos: userSubscription.maxPhotos
        });
        
        // Double check that subscription is active
        if (!userSubscription.isActive) {
          console.warn(`Subscription found but inactive for user: ${decodedToken.id}, activating...`);
          userSubscription.isActive = true;
          await userSubscription.save();
          console.log(`Subscription activated for user: ${decodedToken.id}`);
        }
      } catch (error) {
        console.error(`Error with subscription for user ${decodedToken.id}:`, error);
        return next(new BadRequestError("Failed to create or verify subscription"));
      }

      // Check storage limits before upload - AFTER subscription is confirmed
      console.log(`Checking upload permission for user: ${decodedToken.id}, file size: ${file.size} bytes`);
      const canUpload = await StorageService.canUploadPhoto(
        new mongoose.Types.ObjectId(decodedToken.id),
        file.size
      );

      if (!canUpload.canUpload) {
        console.error(`Upload denied for user ${decodedToken.id}:`, {
          reason: canUpload.reason,
          storageInfo: canUpload.storageInfo,
          userSubscription: {
            planType: userSubscription.planType,
            storageLimit: userSubscription.storageLimit,
            maxPhotos: userSubscription.maxPhotos
          }
        });
        return next(
          new BadRequestError(canUpload.reason || "Upload not allowed")
        );
      }
      console.log(`Upload permission granted for user: ${decodedToken.id}`, {
        storageInfo: canUpload.storageInfo
      });

      // S3 için isim üret
      const fileName = `${Date.now()}-${file.originalname}`;
      const thumbnailName = `thumb-${fileName}`;

      // Orijinal ve Thumbnail oluştur
      console.log(`Starting S3 upload for user: ${decodedToken.id}, fileName: ${fileName}`);
      let originalUrl: string;
      let thumbnailUrl: string;
      
      try {
        const [originalResult, thumbnailResult] = await Promise.all([
          uploadToS3(file.buffer, fileName, file.mimetype),
          sharp(file.buffer)
            .resize({ width: 300 })
            .toBuffer()
            .then((thumbBuffer: any) =>
              uploadToS3(thumbBuffer, thumbnailName, file.mimetype)
            ),
        ]);
        originalUrl = originalResult;
        thumbnailUrl = thumbnailResult;
        console.log(`S3 upload successful for user: ${decodedToken.id}`, { originalUrl, thumbnailUrl });
      } catch (error) {
        console.error(`S3 upload failed for user ${decodedToken.id}:`, error);
        throw error;
      }
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

      console.log(`Saving photo to database for user: ${decodedToken.id}`);
      const savedPhoto = await newPhoto.save();
      console.log(`Photo saved successfully with ID: ${savedPhoto._id}`);

      // Update user's storage usage after successful upload
      console.log(`Updating storage usage for user: ${decodedToken.id}`);
      try {
        await StorageService.updateUserStorage(
          new mongoose.Types.ObjectId(decodedToken.id)
        );
        console.log(`Storage usage updated for user: ${decodedToken.id}`);
      } catch (error) {
        console.error(`Error updating storage usage for user ${decodedToken.id}:`, error);
        // Don't throw here, photo is already saved
      }

      // Get storage info for response (with fallback)
      let storageInfo;
      try {
        storageInfo = await StorageService.getUserStorageInfo(
          new mongoose.Types.ObjectId(decodedToken.id)
        );
        console.log(`Storage info retrieved for user: ${decodedToken.id}`);
      } catch (error) {
        console.error(`Error getting final storage info for user ${decodedToken.id}:`, error);
        // Provide default storage info if retrieval fails
        storageInfo = {
          storageUsage: { totalStorageUsed: 0, photosCount: 0 },
          subscription: { storageLimit: 1024 * 1024 * 100, maxPhotos: 50, planType: "free" },
          storagePercentage: 0,
          photosPercentage: 0
        };
      }

      // Add LovePoints for photo upload
      const pointsResult = await LovePointsService.addPoints(
        decodedToken.id, 
        "photo_upload", 
        { photoId: savedPhoto._id, album: album }
      );

      console.log(`Photo upload completed successfully for user: ${decodedToken.id}`);
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
        gamification: {
          pointsAdded: pointsResult.userLevel?.pointsAdded || 0,
          newAchievements: pointsResult.newAchievements || [],
          levelUp: pointsResult.levelUp || { leveledUp: false },
          currentLevel: pointsResult.userLevel?.currentLevel || 1,
          currentLevelTitle: pointsResult.userLevel?.currentLevelTitle || "New Flame"
        }
      });
    } catch (error: any) {
      console.error("Error in photo upload process:", {
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        userId: decodedToken?.id || 'unknown',
        timestamp: new Date().toISOString()
      });
      next(new BadRequestError("Internal server error"));
      return;
    }
  } catch (error: any) {
    console.error("Critical error in uploadPhotoController:", {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    next(new BadRequestError("Internal server error"));
    return;
  }
};
export default uploadPhotoController;
