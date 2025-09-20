import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "@heaven-nsoft/common";
import { StorageService } from "../services/storageService";
import mongoose from "mongoose";

export const getStorageInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    if (!decodedToken?.id) {
      next(new NotAuthorizedError());
      return;
    }

    // Get user's storage information
    const storageInfo = await StorageService.getUserStorageInfo(new mongoose.Schema.Types.ObjectId(decodedToken.id));

    res.status(200).json({
      message: "Storage info retrieved successfully",
      storageInfo: {
        usedStorage: StorageService.formatBytes(storageInfo.storageUsage.totalStorageUsed),
        totalStorage: StorageService.formatBytes(storageInfo.subscription.storageLimit),
        usedPhotos: storageInfo.storageUsage.photosCount,
        maxPhotos: storageInfo.subscription.maxPhotos,
        storagePercentage: storageInfo.storagePercentage.toFixed(1),
        photosPercentage: storageInfo.photosPercentage.toFixed(1),
        planType: storageInfo.subscription.planType,
        isExpired: storageInfo.subscription.isExpired(),
        daysUntilExpiry: storageInfo.subscription.daysUntilExpiry(),
        planDetails: StorageService.getStoragePlanDetails(storageInfo.subscription.planType)
      }
    });
  } catch (error) {
    console.error("Error getting storage info:", error);
    next(new Error("Internal server error"));
  }
};

export default getStorageInfoController;
