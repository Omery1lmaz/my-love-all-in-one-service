import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const getSubscriptionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getSubscriptionHistory controller started");

    // Token doğrulama
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new NotAuthorizedError());
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
        title: string;
      };
    } catch {
      return next(new NotAuthorizedError());
    }

    if (!decodedToken?.id) {
      return next(new BadRequestError("User ID not found"));
    }

    console.log(`Getting subscription history for user: ${decodedToken.id}`);

    // Kullanıcının mevcut subscription'ını getir
    const subscription = await Subscription.findOne({
      user: new mongoose.Types.ObjectId(decodedToken.id),
    });

    if (!subscription) {
      return res.status(200).json({
        message: "No subscription history found",
        history: [],
        currentSubscription: null,
      });
    }

    // Subscription geçmişi oluştur (şimdilik sadece mevcut subscription)
    // Gerçek uygulamada ayrı bir SubscriptionHistory tablosu olabilir
    const history = [
      {
        id: subscription._id,
        planType: subscription.planType,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        price: subscription.price,
        currency: subscription.currency,
        paymentMethod: subscription.paymentMethod,
        lastPaymentDate: subscription.lastPaymentDate,
        status: subscription.isActive ? "active" : "inactive",
        isExpired: subscription.isExpired(),
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    ];

    console.log(`Subscription history retrieved for user: ${decodedToken.id}`);

    res.status(200).json({
      message: "Subscription history retrieved successfully",
      history: history,
      currentSubscription: {
        id: subscription._id,
        planType: subscription.planType,
        storageLimit: subscription.storageLimit,
        maxPhotos: subscription.maxPhotos,
        isActive: subscription.isActive,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        price: subscription.price,
        currency: subscription.currency,
        paymentMethod: subscription.paymentMethod,
        lastPaymentDate: subscription.lastPaymentDate,
        nextPaymentDate: subscription.nextPaymentDate,
        isExpired: subscription.isExpired(),
        daysUntilExpiry: subscription.daysUntilExpiry(),
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error getting subscription history:", {
      error: error?.message || "Unknown error",
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
    next(new BadRequestError("Failed to get subscription history"));
  }
};

export default getSubscriptionHistory;
