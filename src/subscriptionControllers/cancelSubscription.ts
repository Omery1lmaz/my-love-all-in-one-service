import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("cancelSubscription controller started");
    
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

    console.log(`Cancelling subscription for user: ${decodedToken.id}`);

    // Kullanıcının subscription'ını bul
    const subscription = await Subscription.findOne({ 
      user: new mongoose.Types.ObjectId(decodedToken.id) 
    });

    if (!subscription) {
      return next(new BadRequestError("No subscription found"));
    }

    // Free plan'a geçiş yap
    subscription.planType = "free";
    subscription.storageLimit = 1024 * 1024 * 100; // 100MB
    subscription.maxPhotos = 50;
    subscription.isActive = true; // Free plan her zaman aktif
    subscription.autoRenew = false;
    subscription.price = 0;
    subscription.endDate = undefined; // Free plan'da end date yok
    subscription.nextPaymentDate = undefined;
    subscription.paymentMethod = undefined;

    await subscription.save();

    console.log(`Subscription cancelled and downgraded to free plan for user: ${decodedToken.id}`);

    res.status(200).json({
      message: "Subscription cancelled successfully. Downgraded to free plan.",
      subscription: {
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
        updatedAt: subscription.updatedAt
      },
      note: "Your subscription has been cancelled. You now have access to the free plan features."
    });

  } catch (error: any) {
    console.error("Error cancelling subscription:", {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    next(new BadRequestError("Failed to cancel subscription"));
  }
};

export default cancelSubscription;
