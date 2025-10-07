import mongoose from "mongoose";
import { LovePointsService } from "../services/lovePointsService";

const initializeAchievements = async () => {
  try {
    console.log("🚀 Starting achievement initialization...");
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://omery020040:4YHnA68V7SOwBAAm@cluster0.svjeglz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Initialize achievements
    await LovePointsService.initializeAchievements();
    console.log("✅ Achievements initialized successfully");

    console.log("🎉 Achievement initialization completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing achievements:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initializeAchievements();
}

export { initializeAchievements };

