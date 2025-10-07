import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "@heaven-nsoft/common";

export const getAvailablePlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getAvailablePlans controller started");

    const plans = {
      free: {
        name: "Free Plan",
        planType: "free",
        storageLimit: 1024 * 1024 * 100, // 100MB
        maxPhotos: 50,
        price: 0,
        currency: "USD",
        features: [
          "100MB storage",
          "Up to 50 photos",
          "Basic photo management",
          "Standard support"
        ],
        limitations: [
          "Limited storage space",
          "Limited photo count",
          "No priority support"
        ]
      },
      premium: {
        name: "Premium Plan",
        planType: "premium",
        storageLimit: 1024 * 1024 * 1024 * 5, // 5GB
        maxPhotos: 1000,
        price: 9.99,
        currency: "USD",
        features: [
          "5GB storage",
          "Up to 1000 photos",
          "Advanced photo management",
          "Priority support",
          "High-quality thumbnails",
          "Photo organization tools"
        ],
        limitations: [
          "Monthly subscription required",
          "Limited to 1000 photos"
        ]
      },
      premium_plus: {
        name: "Premium Plus Plan",
        planType: "premium_plus",
        storageLimit: 1024 * 1024 * 1024 * 50, // 50GB
        maxPhotos: 10000,
        price: 19.99,
        currency: "USD",
        features: [
          "50GB storage",
          "Up to 10,000 photos",
          "Advanced photo management",
          "Priority support",
          "High-quality thumbnails",
          "Photo organization tools",
          "Bulk operations",
          "Advanced analytics",
          "API access"
        ],
        limitations: [
          "Monthly subscription required"
        ]
      }
    };

    // Storage limitleri human readable format'a çevir
    const formattedPlans = Object.values(plans).map(plan => ({
      ...plan,
      storageLimitFormatted: formatBytes(plan.storageLimit),
      storageLimitBytes: plan.storageLimit
    }));
    console.log(formattedPlans, "formattedPlans");
    console.log("Available plans retrieved successfully");

    res.status(200).json({
      message: "Available plans retrieved successfully",
      plans: formattedPlans,
      currentCurrency: "USD",
      billingCycle: "monthly"
    });

  } catch (error: any) {
    console.error("Error getting available plans:", {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    next(new BadRequestError("Failed to get available plans"));
  }
};

// Bytes'ı human readable format'a çeviren helper fonksiyon
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default getAvailablePlans;
