import mongoose, { Schema, Document, Model } from "mongoose";

interface StorageUsageAttrs {
  user: mongoose.Types.ObjectId;
  totalStorageUsed: number; // in bytes
  photosCount: number;
  lastUpdated: Date;
}

interface StorageUsageDoc extends Document {
  user: mongoose.Types.ObjectId;
  totalStorageUsed: number;
  photosCount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface StorageUsageModel extends Model<StorageUsageDoc> {
  build(attrs: StorageUsageAttrs): StorageUsageDoc;
  updateUserStorage(userId: mongoose.Types.ObjectId): Promise<StorageUsageDoc>;
}

const storageUsageSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    totalStorageUsed: { 
      type: Number, 
      default: 0,
      required: true 
    },
    photosCount: { 
      type: Number, 
      default: 0,
      required: true 
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now,
      required: true 
    },
  },
  { timestamps: true }
);

// Static method to update user storage
storageUsageSchema.statics.updateUserStorage = async function(userId: mongoose.Types.ObjectId) {
  const Photo = mongoose.model("Photo");
  
  // Calculate total storage used by user's photos
  const photos = await Photo.find({ 
    user: userId, 
    isDeleted: { $ne: true } 
  });
  
  const totalStorageUsed = photos.reduce((total, photo) => {
    return total + (photo.fileSize || 0);
  }, 0);
  
  // Update or create storage usage record
  const storageUsage = await this.findOneAndUpdate(
    { user: userId },
    { 
      totalStorageUsed,
      photosCount: photos.length,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
  
  return storageUsage;
};

storageUsageSchema.statics.build = (attrs: StorageUsageAttrs) => {
  return new StorageUsage(attrs);
};

const StorageUsage = mongoose.model<StorageUsageDoc, StorageUsageModel>("StorageUsage", storageUsageSchema);

export { StorageUsage };
