import mongoose, { Schema, Document, Model } from "mongoose";

interface SubscriptionAttrs {
  user: mongoose.Schema.Types.ObjectId;
  planType: "free" | "premium" | "premium_plus";
  storageLimit: number; // in bytes
  maxPhotos: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
  price?: number;
  currency?: string;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
}

interface SubscriptionDoc extends Document {
  user: mongoose.Schema.Types.ObjectId;
  planType: "free" | "premium" | "premium_plus";
  storageLimit: number;
  maxPhotos: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
  price?: number;
  currency?: string;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  daysUntilExpiry(): number;
}

interface SubscriptionModel extends Model<SubscriptionDoc> {
  build(attrs: SubscriptionAttrs): SubscriptionDoc;
  getDefaultSubscription(userId: mongoose.Schema.Types.ObjectId): Promise<SubscriptionDoc>;
  getActiveSubscription(userId: mongoose.Schema.Types.ObjectId): Promise<SubscriptionDoc | null>;
}

const subscriptionSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    planType: { 
      type: String, 
      enum: ["free", "premium", "premium_plus"],
      default: "free",
      required: true 
    },
    storageLimit: { 
      type: Number, 
      required: true,
      default: 1024 * 1024 * 100 // 100MB for free plan
    },
    maxPhotos: { 
      type: Number, 
      required: true,
      default: 50 // 50 photos for free plan
    },
    startDate: { 
      type: Date, 
      default: Date.now,
      required: true 
    },
    endDate: { 
      type: Date 
    },
    isActive: { 
      type: Boolean, 
      default: true,
      required: true 
    },
    autoRenew: { 
      type: Boolean, 
      default: false 
    },
    price: { 
      type: Number 
    },
    currency: { 
      type: String,
      default: "USD" 
    },
    paymentMethod: { 
      type: String 
    },
    lastPaymentDate: { 
      type: Date 
    },
    nextPaymentDate: { 
      type: Date 
    },
  },
  { timestamps: true }
);

// Method to check if subscription is expired
subscriptionSchema.methods.isExpired = function() {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
};

// Method to get days until expiry
subscriptionSchema.methods.daysUntilExpiry = function() {
  if (!this.endDate) return Infinity;
  const now = new Date();
  const diffTime = this.endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Static method to get or create default subscription
subscriptionSchema.statics.getDefaultSubscription = async function(userId: mongoose.Schema.Types.ObjectId) {
  let subscription = await this.findOne({ user: userId });
  
  if (!subscription) {
    subscription = await this.create({
      user: userId,
      planType: "free",
      storageLimit: 1024 * 1024 * 100, // 100MB
      maxPhotos: 50,
      isActive: true
    });
  }
  
  return subscription;
};

// Static method to get active subscription
subscriptionSchema.statics.getActiveSubscription = async function(userId: mongoose.Schema.Types.ObjectId) {
  const subscription = await this.findOne({ 
    user: userId,
    isActive: true 
  });
  
  if (subscription && subscription.isExpired()) {
    // Deactivate expired subscription
    subscription.isActive = false;
    await subscription.save();
    return null;
  }
  
  return subscription;
};

subscriptionSchema.statics.build = (attrs: SubscriptionAttrs) => {
  return new Subscription(attrs);
};

const Subscription = mongoose.model("Subscription", subscriptionSchema) as SubscriptionModel;

export { Subscription };
