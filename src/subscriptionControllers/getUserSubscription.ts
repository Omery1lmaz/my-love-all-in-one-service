import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
import { Subscription } from "../Models/subscription";
import { StorageUsage } from "../Models/storageUsage";
import { AIChatSession } from "../Models/aiChat";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const getUserSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getUserSubscription controller started");

    // Token doğrulama
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next(new NotAuthorizedError());
      return;
    }

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
      next(new BadRequestError("User ID not found"));
      return;
    }

    console.log(`Getting subscription for user: ${decodedToken.id}`);

    const userId = new mongoose.Types.ObjectId(decodedToken.id);

    // Kullanıcının subscription'ını getir
    const subscription = await Subscription.findOne({
      user: userId,
    });

    // Kullanıcının storage kullanımını getir
    const storageUsage = await StorageUsage.findOne({ user: userId });

    // AI chat kullanımını hesapla (bu ay içindeki mesaj sayısı)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const aiChatSessions = await AIChatSession.find({
      userId: userId,
      isActive: true,
      updatedAt: { $gte: startOfMonth },
    });

    // Toplam AI mesaj sayısını hesapla
    const totalAIMessages: any = aiChatSessions.reduce((total, session) => {
      return (
        total + session.messages.filter((msg) => msg.role === "user").length
      );
    }, 0);

    if (!subscription) {
      console.log(
        `No subscription found for user: ${decodedToken.id}, creating default`
      );
      // Eğer subscription yoksa default oluştur
      const newSubscription = await Subscription.getDefaultSubscription(userId);

      // Kullanım detaylarını hesapla
      const currentStorageUsed = storageUsage?.totalStorageUsed || 0;
      const currentPhotosCount = storageUsage?.photosCount || 0;
      const remainingPhotos = Math.max(
        0,
        newSubscription.maxPhotos - currentPhotosCount
      );
      const remainingStorage = Math.max(
        0,
        newSubscription.storageLimit - currentStorageUsed
      );

      // AI kullanım limitlerini plan tipine göre belirle
      const aiLimits = getAILimits(newSubscription.planType);
      const remainingAIMessages = Math.max(
        0,
        aiLimits.monthlyMessages - totalAIMessages
      );

      res.status(200).json({
        message: "Default subscription created",
        subscription: {
          id: newSubscription._id,
          planType: newSubscription.planType,
          storageLimit: newSubscription.storageLimit,
          maxPhotos: newSubscription.maxPhotos,
          isActive: newSubscription.isActive,
          startDate: newSubscription.startDate,
          endDate: newSubscription.endDate,
          autoRenew: newSubscription.autoRenew,
          price: newSubscription.price,
          currency: newSubscription.currency,
          isExpired: newSubscription.isExpired(),
          daysUntilExpiry: newSubscription.daysUntilExpiry(),
          createdAt: newSubscription.createdAt,
          updatedAt: newSubscription.updatedAt,
        },
        usage: {
          storage: {
            used: currentStorageUsed,
            limit: newSubscription.storageLimit,
            remaining: remainingStorage,
            usedPercentage: Math.round(
              (currentStorageUsed / newSubscription.storageLimit) * 100
            ),
          },
          photos: {
            used: currentPhotosCount,
            limit: newSubscription.maxPhotos,
            remaining: remainingPhotos,
            usedPercentage: Math.round(
              (currentPhotosCount / newSubscription.maxPhotos) * 100
            ),
          },
          aiChat: {
            monthlyMessages: {
              used: totalAIMessages,
              limit: aiLimits.monthlyMessages,
              remaining: remainingAIMessages,
              usedPercentage: Math.round(
                (totalAIMessages / aiLimits.monthlyMessages) * 100
              ),
            },
            coachSessions: {
              used: aiChatSessions.filter(
                (s) => s.coachType && s.coachType !== "general"
              ).length,
              limit: aiLimits.monthlyCoachSessions,
              remaining: Math.max(
                0,
                aiLimits.monthlyCoachSessions -
                  aiChatSessions.filter(
                    (s) => s.coachType && s.coachType !== "general"
                  ).length
              ),
            },
          },
        },
      });
      return;
    }

    console.log(`Subscription found for user: ${decodedToken.id}`, {
      planType: subscription.planType,
      isActive: subscription.isActive,
      isExpired: subscription.isExpired(),
    });

    // Kullanım detaylarını hesapla
    const currentStorageUsed = storageUsage?.totalStorageUsed || 0;
    const currentPhotosCount = storageUsage?.photosCount || 0;
    const remainingPhotos = Math.max(
      0,
      subscription.maxPhotos - currentPhotosCount
    );
    const remainingStorage = Math.max(
      0,
      subscription.storageLimit - currentStorageUsed
    );

    // AI kullanım limitlerini plan tipine göre belirle
    const aiLimits = getAILimits(subscription.planType);
    const remainingAIMessages = Math.max(
      0,
      aiLimits.monthlyMessages - totalAIMessages
    );

    res.status(200).json({
      message: "Subscription retrieved successfully",
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
        updatedAt: subscription.updatedAt,
      },
      usage: {
        storage: {
          used: currentStorageUsed,
          limit: subscription.storageLimit,
          remaining: remainingStorage,
          usedPercentage: Math.round(
            (currentStorageUsed / subscription.storageLimit) * 100
          ),
        },
        photos: {
          used: currentPhotosCount,
          limit: subscription.maxPhotos,
          remaining: remainingPhotos,
          usedPercentage: Math.round(
            (currentPhotosCount / subscription.maxPhotos) * 100
          ),
        },
        aiChat: {
          monthlyMessages: {
            used: totalAIMessages,
            limit: aiLimits.monthlyMessages,
            remaining: remainingAIMessages,
            usedPercentage: Math.round(
              (totalAIMessages / aiLimits.monthlyMessages) * 100
            ),
          },
          coachSessions: {
            used: aiChatSessions.filter(
              (s) => s.coachType && s.coachType !== "general"
            ).length,
            limit: aiLimits.monthlyCoachSessions,
            remaining: Math.max(
              0,
              aiLimits.monthlyCoachSessions -
                aiChatSessions.filter(
                  (s) => s.coachType && s.coachType !== "general"
                ).length
            ),
          },
        },
      },
    });
  } catch (error: any) {
    console.error("Error getting user subscription:", {
      error: error?.message || "Unknown error",
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
    next(new BadRequestError("Failed to get subscription"));
    return;
  }
};

// Helper function to get AI limits based on plan type
function getAILimits(planType: string) {
  const limits = {
    free: {
      monthlyMessages: 20,
      monthlyCoachSessions: 5,
    },
    premium: {
      monthlyMessages: 200,
      monthlyCoachSessions: 50,
    },
    premium_plus: {
      monthlyMessages: 1000,
      monthlyCoachSessions: 200,
    },
  };

  return limits[planType as keyof typeof limits] || limits.free;
}

export default getUserSubscription;
