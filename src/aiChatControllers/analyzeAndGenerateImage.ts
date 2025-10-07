import { Request, Response } from "express";
import * as aiClient from "../utils/aiClient";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";
import multer from "multer";
import jwt from "jsonwebtoken";
import { uploadToS3 } from "../utils/upload"; // Added S3 upload function

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const uploadMiddleware = upload.single('image');

export const analyzeAndGenerateImageController = async (req: Request, res: Response) => {
  try {
    const { style = "realistic", additionalPrompt = "" } = req.body;
    
    // Handle authentication manually
    const authHeader = req.headers.authorization;
    if (!authHeader) {
       res.status(401).json({
        success: false,
        message: "Lütfen giriş yapın"
      });
      return
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
       res.status(401).json({
        success: false,
        message: "Geçersiz token"
      });
      return
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any;
      userId = decoded.id;
    } catch (error) {
       res.status(401).json({
        success: false,
        message: "Geçersiz token"
      });
      return
    }

    // Check if image file was uploaded
    if (!req.file) {
       res.status(400).json({
        success: false,
        message: "Image file is required"
      });
      return
    }

    // Validate style
    const validStyles = ["realistic", "cartoon", "anime", "watercolor", "oil_painting", "digital_art"];
    if (!validStyles.includes(style)) {
       res.status(400).json({
        success: false,
        message: "Invalid style. Valid styles are: " + validStyles.join(", ")
      });
      return
    }

    // Ensure user has a subscription
    let userSubscription;
    try {
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(userId)
      );
      
      if (!userSubscription.isActive) {
        userSubscription.isActive = true;
        await userSubscription.save();
      }
    } catch (error) {
      console.error(`Error with subscription for image analysis and generation - user ${userId}:`, error);
       res.status(400).json({ 
        success: false,
        message: "Subscription doğrulanamadı" 
      });
      return
    }

    console.log(`Starting image analysis and generation for user: ${userId}`, {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      style,
      additionalPrompt,
      planType: userSubscription.planType
    });

    // Analyze and generate image using Google Gemini + Stable Diffusion
    const result = await aiClient.analyzeAndGenerateImage({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      style,
      additionalPrompt,
    });

    if (result.status !== "success") {
      console.error(`Image analysis and generation failed for user: ${userId}`, {
        error: result.error
      });
      
       res.status(500).json({
        success: false,
        message: "Resim analizi ve oluşturma başarısız",
        error: result.error
      });
      return
    }

    console.log(`Image analysis and generation completed for user: ${userId}`, {
      analysisLength: result.analysis.length,
      hasGeneratedImage: !!result.generatedImageBase64,
      planType: userSubscription.planType
    });

    // Upload generated image to S3
    let generatedImageUrl = "";
    try {
      if (result.generatedImageBase64) {
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(result.generatedImageBase64, 'base64');
        
        // Generate unique filename
        const fileName = `ai-generated-${Date.now()}-${userId}.png`;
        
        // Upload to S3
        generatedImageUrl = await uploadToS3(imageBuffer, fileName, 'image/png');
        
        console.log(`Generated image uploaded to S3 for user: ${userId}`, {
          fileName,
          url: generatedImageUrl
        });
      }
    } catch (s3Error) {
      console.error(`S3 upload failed for generated image, user: ${userId}`, s3Error);
      // Continue without S3 URL, still return base64
    }

     res.status(200).json({
      success: true,
      message: "Resim analizi ve oluşturma başarılı",
      data: {
        analysis: result.analysis,
        generatedImageBase64: result.generatedImageBase64,
        generatedImageUrl: generatedImageUrl, // S3 URL
        style,
        additionalPrompt,
        method: "google_gemini_image_generation"
      },
      subscriptionInfo: {
        planType: userSubscription.planType,
        isActive: userSubscription.isActive
      }
    });

  } catch (error) {
    console.error("Error in analyzeAndGenerateImageController:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return
  }
};
