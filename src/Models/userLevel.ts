import mongoose, { Document, Model, Schema } from "mongoose";

// Love Journey Level System
export interface LoveLevel {
  level: number;
  title: string;
  description: string;
  requiredPoints: number;
  visualStyle: string;
  emoji: string;
}

export const LOVE_LEVELS: LoveLevel[] = [
  {
    level: 1,
    title: "New Flame",
    description: "Aşk yolculuğuna yeni başlayan kullanıcı",
    requiredPoints: 0,
    visualStyle: "Parlayan kalp emojisi",
    emoji: "💖"
  },
  {
    level: 2,
    title: "Warm Connection",
    description: "Partneriyle ilk anılarını paylaşmaya başlayan",
    requiredPoints: 100,
    visualStyle: "Sıcak tonlu halka animasyonu",
    emoji: "🔅"
  },
  {
    level: 3,
    title: "True Listener",
    description: "Partnerinin duygularını anlamaya başlayan",
    requiredPoints: 300,
    visualStyle: "Gradient mavi & pembe dalgalar",
    emoji: "💫"
  },
  {
    level: 4,
    title: "Emotional Bond",
    description: "Düzenli notlar, paylaşımlar ve aktiviteler yapan",
    requiredPoints: 600,
    visualStyle: "Parlayan zincir animasyonu",
    emoji: "🔗"
  },
  {
    level: 5,
    title: "Soulmate Sync",
    description: "Uygulamanın tüm özelliklerini aktif kullanan, tam senkron partner",
    requiredPoints: 1000,
    visualStyle: "Işıltılı aurora efekti",
    emoji: "🌌"
  }
];

// Love Points System
export interface LovePointsAction {
  action: string;
  points: number;
  description: string;
}

export const LOVE_POINTS_ACTIONS: LovePointsAction[] = [
  {
    action: "daily_note",
    points: 10,
    description: "Günlük not ekleme"
  },
  {
    action: "photo_upload",
    points: 15,
    description: "Partnerle fotoğraf yükleme"
  },
  {
    action: "playlist_create",
    points: 20,
    description: "Playlist oluşturma"
  },
  {
    action: "event_create",
    points: 25,
    description: "Partnerle ortak etkinlik oluşturma"
  },
  {
    action: "comment_on_partner_note",
    points: 5,
    description: "Partnerin notuna yorum / emoji bırakma"
  },
  {
    action: "seven_day_streak",
    points: 50,
    description: "Partnerle 7 gün aralıksız etkileşim"
  },
  {
    action: "challenge_complete",
    points: 30,
    description: "Uygulama içi Challenge tamamlama"
  },
  {
    action: "first_photo_together",
    points: 40,
    description: "İlk birlikte fotoğraf"
  },
  {
    action: "anniversary_reminder",
    points: 35,
    description: "Yıldönümü hatırlatması"
  },
  {
    action: "mood_share",
    points: 8,
    description: "Ruh hali paylaşımı"
  }
];

// User Level Interface
export interface UserLevelAttrs {
  userId: mongoose.Schema.Types.ObjectId;
  currentLevel: number;
  totalPoints: number;
  pointsToNextLevel: number;
  currentLevelTitle: string;
  currentLevelEmoji: string;
  levelProgress: number; // Percentage (0-100)
  lastActivityDate?: Date;
  streakDays: number;
  totalActivities: number;
  achievements: mongoose.Schema.Types.ObjectId[];
  weeklyPoints: number;
  monthlyPoints: number;
  allTimePoints: number;
  levelHistory: {
    level: number;
    title: string;
    achievedAt: Date;
    pointsAtLevel: number;
  }[];
  pointsBreakdown: {
    dailyNotes: number;
    photoUploads: number;
    playlists: number;
    events: number;
    comments: number;
    streaks: number;
    challenges: number;
    other: number;
  };
}

export interface UserLevelDoc extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  currentLevel: number;
  totalPoints: number;
  pointsToNextLevel: number;
  currentLevelTitle: string;
  currentLevelEmoji: string;
  levelProgress: number;
  lastActivityDate?: Date;
  streakDays: number;
  totalActivities: number;
  achievements: mongoose.Schema.Types.ObjectId[];
  weeklyPoints: number;
  monthlyPoints: number;
  allTimePoints: number;
  levelHistory: {
    level: number;
    title: string;
    achievedAt: Date;
    pointsAtLevel: number;
  }[];
  pointsBreakdown: {
    dailyNotes: number;
    photoUploads: number;
    playlists: number;
    events: number;
    comments: number;
    streaks: number;
    challenges: number;
    other: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLevelModel extends Model<UserLevelDoc> {
  build(attrs: UserLevelAttrs): UserLevelDoc;
  calculateLevel(points: number): LoveLevel;
  calculateProgress(currentPoints: number, currentLevel: number): number;
  addPoints(userId: string, action: string, points: number): Promise<UserLevelDoc>;
}

const userLevelSchema = new Schema<UserLevelDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    pointsToNextLevel: {
      type: Number,
      default: 100
    },
    currentLevelTitle: {
      type: String,
      default: "New Flame"
    },
    currentLevelEmoji: {
      type: String,
      default: "💖"
    },
    levelProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastActivityDate: {
      type: Date,
      default: Date.now
    },
    streakDays: {
      type: Number,
      default: 0,
      min: 0
    },
    totalActivities: {
      type: Number,
      default: 0,
      min: 0
    },
    achievements: [{
      type: Schema.Types.ObjectId,
      ref: "Achievement"
    }],
    weeklyPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    monthlyPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    allTimePoints: {
      type: Number,
      default: 0,
      min: 0
    },
    levelHistory: [{
      level: {
        type: Number,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      achievedAt: {
        type: Date,
        default: Date.now
      },
      pointsAtLevel: {
        type: Number,
        required: true
      }
    }],
    pointsBreakdown: {
      dailyNotes: {
        type: Number,
        default: 0
      },
      photoUploads: {
        type: Number,
        default: 0
      },
      playlists: {
        type: Number,
        default: 0
      },
      events: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      },
      streaks: {
        type: Number,
        default: 0
      },
      challenges: {
        type: Number,
        default: 0
      },
      other: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// Static method to calculate level based on points
userLevelSchema.statics.calculateLevel = function(points: number): LoveLevel {
  for (let i = LOVE_LEVELS.length - 1; i >= 0; i--) {
    if (points >= LOVE_LEVELS[i].requiredPoints) {
      return LOVE_LEVELS[i];
    }
  }
  return LOVE_LEVELS[0];
};

// Static method to calculate progress percentage
userLevelSchema.statics.calculateProgress = function(currentPoints: number, currentLevel: number): number {
  const currentLevelData = LOVE_LEVELS.find(level => level.level === currentLevel);
  const nextLevelData = LOVE_LEVELS.find(level => level.level === currentLevel + 1);
  
  if (!currentLevelData || !nextLevelData) {
    return 100; // Max level reached
  }
  
  const pointsInCurrentLevel = currentPoints - currentLevelData.requiredPoints;
  const pointsNeededForNextLevel = nextLevelData.requiredPoints - currentLevelData.requiredPoints;
  
  return Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
};

// Static method to add points and update level
userLevelSchema.statics.addPoints = async function(
  userId: string, 
  action: string, 
  points: number
): Promise<UserLevelDoc> {
  const userLevel = await this.findOne({ userId });
  
  if (!userLevel) {
    // Create new user level record
    const newUserLevel = this.build({
      userId: new mongoose.Types.ObjectId(userId),
      currentLevel: 1,
      totalPoints: points,
      pointsToNextLevel: 100,
      currentLevelTitle: "New Flame",
      currentLevelEmoji: "💖",
      levelProgress: 0,
      streakDays: 1,
      totalActivities: 1,
      achievements: [],
      weeklyPoints: points,
      monthlyPoints: points,
      allTimePoints: points,
      levelHistory: [],
      pointsBreakdown: {
        dailyNotes: action === 'daily_note' ? points : 0,
        photoUploads: action === 'photo_upload' ? points : 0,
        playlists: action === 'playlist_create' ? points : 0,
        events: action === 'event_create' ? points : 0,
        comments: action === 'comment_on_partner_note' ? points : 0,
        streaks: action === 'seven_day_streak' ? points : 0,
        challenges: action === 'challenge_complete' ? points : 0,
        other: 0
      }
    });
    
    return await newUserLevel.save();
  }
  
  // Update existing user level
  const oldLevel = userLevel.currentLevel;
  userLevel.totalPoints += points;
  userLevel.allTimePoints += points;
  userLevel.weeklyPoints += points;
  userLevel.monthlyPoints += points;
  userLevel.totalActivities += 1;
  userLevel.lastActivityDate = new Date();
  
  // Update points breakdown
  switch (action) {
    case 'daily_note':
      userLevel.pointsBreakdown.dailyNotes += points;
      break;
    case 'photo_upload':
      userLevel.pointsBreakdown.photoUploads += points;
      break;
    case 'playlist_create':
      userLevel.pointsBreakdown.playlists += points;
      break;
    case 'event_create':
      userLevel.pointsBreakdown.events += points;
      break;
    case 'comment_on_partner_note':
      userLevel.pointsBreakdown.comments += points;
      break;
    case 'seven_day_streak':
      userLevel.pointsBreakdown.streaks += points;
      break;
    case 'challenge_complete':
      userLevel.pointsBreakdown.challenges += points;
      break;
    default:
      userLevel.pointsBreakdown.other += points;
  }
  
  // Calculate new level
  const newLevelData = this.calculateLevel(userLevel.totalPoints);
  const newLevel = newLevelData.level;
  
  if (newLevel > oldLevel) {
    // Level up!
    userLevel.currentLevel = newLevel;
    userLevel.currentLevelTitle = newLevelData.title;
    userLevel.currentLevelEmoji = newLevelData.emoji;
    
    // Add to level history
    userLevel.levelHistory.push({
      level: newLevel,
      title: newLevelData.title,
      achievedAt: new Date(),
      pointsAtLevel: userLevel.totalPoints
    });
  }
  
  // Calculate progress and points to next level
  userLevel.levelProgress = this.calculateProgress(userLevel.totalPoints, userLevel.currentLevel);
  
  const nextLevelData = LOVE_LEVELS.find(level => level.level === userLevel.currentLevel + 1);
  if (nextLevelData) {
    userLevel.pointsToNextLevel = nextLevelData.requiredPoints - userLevel.totalPoints;
  } else {
    userLevel.pointsToNextLevel = 0; // Max level reached
  }
  
  return await userLevel.save();
};

// Build method
userLevelSchema.statics.build = (attrs: UserLevelAttrs) => {
  return new UserLevel(attrs);
};

// Index for better performance
userLevelSchema.index({ userId: 1 });
userLevelSchema.index({ currentLevel: 1 });
userLevelSchema.index({ totalPoints: -1 });

const UserLevel = mongoose.model<UserLevelDoc, UserLevelModel>("UserLevel", userLevelSchema);

export { UserLevel };

