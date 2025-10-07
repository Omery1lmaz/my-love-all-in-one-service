import mongoose, { Document, Model, Schema } from "mongoose";

// Achievement System
export interface AchievementAttrs {
  name: string;
  description: string;
  emoji: string;
  category: "memory" | "connection" | "streak" | "milestone" | "special";
  requirement: {
    type: "count" | "streak" | "points" | "date" | "custom";
    value: number;
    description: string;
  };
  pointsReward: number;
  isActive: boolean;
  isSecret: boolean; // Hidden until unlocked
  rarity: "common" | "rare" | "epic" | "legendary";
  visualStyle: string;
  unlockMessage: string;
}

export interface AchievementDoc extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  emoji: string;
  category: "memory" | "connection" | "streak" | "milestone" | "special";
  requirement: {
    type: "count" | "streak" | "points" | "date" | "custom";
    value: number;
    description: string;
  };
  pointsReward: number;
  isActive: boolean;
  isSecret: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  visualStyle: string;
  unlockMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementModel extends Model<AchievementDoc> {
  build(attrs: AchievementAttrs): AchievementDoc;
  getAchievementsByCategory(category: string): Promise<AchievementDoc[]>;
  getSecretAchievements(): Promise<AchievementDoc[]>;
}

// User Achievement Progress
export interface UserAchievementAttrs {
  userId: mongoose.Schema.Types.ObjectId;
  achievementId: mongoose.Schema.Types.ObjectId;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100 percentage
  currentValue: number; // Current progress towards requirement
  requirementValue: number;
}

export interface UserAchievementDoc extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  achievementId: mongoose.Schema.Types.ObjectId;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  currentValue: number;
  requirementValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievementModel extends Model<UserAchievementDoc> {
  build(attrs: UserAchievementAttrs): UserAchievementDoc;
  updateProgress(userId: string, achievementId: string, newValue: number): Promise<UserAchievementDoc>;
  getUnlockedAchievements(userId: string): Promise<UserAchievementDoc[]>;
  getProgressAchievements(userId: string): Promise<UserAchievementDoc[]>;
}

// Predefined Achievements
export const PREDEFINED_ACHIEVEMENTS: AchievementAttrs[] = [
  {
    name: "Memory Keeper",
    description: "10 fotoğraf yüklediğinde",
    emoji: "💌",
    category: "memory",
    requirement: {
      type: "count",
      value: 10,
      description: "10 fotoğraf yükle"
    },
    pointsReward: 50,
    isActive: true,
    isSecret: false,
    rarity: "common",
    visualStyle: "Parlayan fotoğraf çerçevesi",
    unlockMessage: "🏆 Tebrikler! Memory Keeper rozetini kazandın!"
  },
  {
    name: "Sound of Love",
    description: "5 playlist oluşturduğunda",
    emoji: "🎶",
    category: "connection",
    requirement: {
      type: "count",
      value: 5,
      description: "5 playlist oluştur"
    },
    pointsReward: 75,
    isActive: true,
    isSecret: false,
    rarity: "common",
    visualStyle: "Müzik notları animasyonu",
    unlockMessage: "🎵 Harika! Sound of Love rozetini kazandın!"
  },
  {
    name: "Harmony Seeker",
    description: "Partnerle 3 ortak not paylaştığında",
    emoji: "🕊️",
    category: "connection",
    requirement: {
      type: "count",
      value: 3,
      description: "3 ortak not paylaş"
    },
    pointsReward: 60,
    isActive: true,
    isSecret: false,
    rarity: "common",
    visualStyle: "Uyumlu dalgalar",
    unlockMessage: "🕊️ Mükemmel! Harmony Seeker rozetini kazandın!"
  },
  {
    name: "Night Writer",
    description: "Gece 00:00-04:00 arasında 3 kez not yazdığında",
    emoji: "🌙",
    category: "special",
    requirement: {
      type: "count",
      value: 3,
      description: "Gece 3 kez not yaz"
    },
    pointsReward: 40,
    isActive: true,
    isSecret: true,
    rarity: "rare",
    visualStyle: "Ay ışığı efekti",
    unlockMessage: "🌙 Gizli rozet! Night Writer rozetini kazandın!"
  },
  {
    name: "Love Streak",
    description: "10 gün aralıksız giriş yaptığında",
    emoji: "🔥",
    category: "streak",
    requirement: {
      type: "streak",
      value: 10,
      description: "10 günlük streak yap"
    },
    pointsReward: 100,
    isActive: true,
    isSecret: false,
    rarity: "rare",
    visualStyle: "Ateş animasyonu",
    unlockMessage: "🔥 İnanılmaz! Love Streak rozetini kazandın!"
  },
  {
    name: "Eternal Flame",
    description: "1000 toplam puana ulaştığında",
    emoji: "💞",
    category: "milestone",
    requirement: {
      type: "points",
      value: 1000,
      description: "1000 puan topla"
    },
    pointsReward: 200,
    isActive: true,
    isSecret: false,
    rarity: "epic",
    visualStyle: "Ebedi alev efekti",
    unlockMessage: "💞 Efsanevi! Eternal Flame rozetini kazandın!"
  },
  {
    name: "First Photo Together",
    description: "İlk birlikte fotoğrafını yüklediğinde",
    emoji: "📸",
    category: "milestone",
    requirement: {
      type: "count",
      value: 1,
      description: "İlk birlikte fotoğraf"
    },
    pointsReward: 30,
    isActive: true,
    isSecret: false,
    rarity: "common",
    visualStyle: "Kalp çerçevesi",
    unlockMessage: "📸 İlk anı! First Photo Together rozetini kazandın!"
  },
  {
    name: "Anniversary Master",
    description: "5 yıldönümü hatırlatması oluşturduğunda",
    emoji: "🎂",
    category: "connection",
    requirement: {
      type: "count",
      value: 5,
      description: "5 yıldönümü hatırlatması"
    },
    pointsReward: 80,
    isActive: true,
    isSecret: false,
    rarity: "rare",
    visualStyle: "Pasta ve konfeti",
    unlockMessage: "🎂 Harika! Anniversary Master rozetini kazandın!"
  },
  {
    name: "Mood Tracker",
    description: "30 gün boyunca ruh halini paylaştığında",
    emoji: "😊",
    category: "streak",
    requirement: {
      type: "streak",
      value: 30,
      description: "30 günlük mood streak"
    },
    pointsReward: 120,
    isActive: true,
    isSecret: false,
    rarity: "epic",
    visualStyle: "Renkli mood bulutları",
    unlockMessage: "😊 Süper! Mood Tracker rozetini kazandın!"
  },
  {
    name: "Soulmate Sync",
    description: "Tüm seviyeleri tamamladığında",
    emoji: "🌌",
    category: "milestone",
    requirement: {
      type: "points",
      value: 1000,
      description: "Maksimum seviyeye ulaş"
    },
    pointsReward: 500,
    isActive: true,
    isSecret: true,
    rarity: "legendary",
    visualStyle: "Aurora borealis efekti",
    unlockMessage: "🌌 Efsanevi! Soulmate Sync rozetini kazandın!"
  }
];

const achievementSchema = new Schema<AchievementDoc>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["memory", "connection", "streak", "milestone", "special"],
      required: true
    },
    requirement: {
      type: {
        type: String,
        enum: ["count", "streak", "points", "date", "custom"],
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    },
    pointsReward: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isSecret: {
      type: Boolean,
      default: false
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common"
    },
    visualStyle: {
      type: String,
      required: true
    },
    unlockMessage: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// User Achievement Progress Schema
const userAchievementSchema = new Schema<UserAchievementDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: {
      type: Date
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0
    },
    requirementValue: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Static methods for Achievement
achievementSchema.statics.build = (attrs: AchievementAttrs) => {
  return new Achievement(attrs);
};

achievementSchema.statics.getAchievementsByCategory = async function(category: string): Promise<AchievementDoc[]> {
  return this.find({ category, isActive: true }).sort({ pointsReward: 1 });
};

achievementSchema.statics.getSecretAchievements = async function(): Promise<AchievementDoc[]> {
  return this.find({ isSecret: true, isActive: true });
};

// Static methods for UserAchievement
userAchievementSchema.statics.build = (attrs: UserAchievementAttrs) => {
  return new UserAchievement(attrs);
};

userAchievementSchema.statics.updateProgress = async function(
  userId: string, 
  achievementId: string, 
  newValue: number
): Promise<UserAchievementDoc> {
  const userAchievement = await this.findOne({ userId, achievementId });
  
  if (!userAchievement) {
    // Create new progress record
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      throw new Error("Achievement not found");
    }
    
    const newUserAchievement = this.build({
      userId: new mongoose.Types.ObjectId(userId),
      achievementId: new mongoose.Types.ObjectId(achievementId),
      isUnlocked: false,
      progress: 0,
      currentValue: newValue,
      requirementValue: achievement.requirement.value
    });
    
    return await newUserAchievement.save();
  }
  
  // Update existing progress
  userAchievement.currentValue = newValue;
  userAchievement.progress = Math.min(100, (newValue / userAchievement.requirementValue) * 100);
  
  // Check if achievement is unlocked
  if (!userAchievement.isUnlocked && newValue >= userAchievement.requirementValue) {
    userAchievement.isUnlocked = true;
    userAchievement.unlockedAt = new Date();
    userAchievement.progress = 100;
  }
  
  return await userAchievement.save();
};

userAchievementSchema.statics.getUnlockedAchievements = async function(userId: string): Promise<UserAchievementDoc[]> {
  return this.find({ userId, isUnlocked: true })
    .populate('achievementId')
    .sort({ unlockedAt: -1 });
};

userAchievementSchema.statics.getProgressAchievements = async function(userId: string): Promise<UserAchievementDoc[]> {
  return this.find({ userId, isUnlocked: false })
    .populate('achievementId')
    .sort({ progress: -1 });
};

// Indexes for better performance
achievementSchema.index({ category: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ rarity: 1 });

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, isUnlocked: 1 });

const Achievement = mongoose.model<AchievementDoc, AchievementModel>("Achievement", achievementSchema);
const UserAchievement = mongoose.model<UserAchievementDoc, UserAchievementModel>("UserAchievement", userAchievementSchema);

export { Achievement, UserAchievement };

