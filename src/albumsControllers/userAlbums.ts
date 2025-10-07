import { Publish } from "./../../node_modules/aws-sdk/clients/stepfunctions.d";
import { NextFunction, Request, Response } from "express";
import { Album } from "../Models/album";
import {
  BadRequestError,
  NotAuthorizedError,
  AlbumCreatedEvent,
} from "@heaven-nsoft/my-love-common";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { natsWrapper } from "../nats-wrapper";
import { Subscription } from "../Models/subscription";

export const userAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("test");
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
        partnerId: string;
      };
    } catch (err) {
      console.log("err", err);
      next(new NotAuthorizedError());
      return;
    }

    if (!decodedToken?.id) {
      console.log("no id");
      next(new NotAuthorizedError());
      return;
    }

    // Ensure user has a subscription (create default if not exists)
    console.log(`Ensuring subscription exists for album listing - user: ${decodedToken.id}`);
    let userSubscription;
    try {
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(decodedToken.id)
      );
      console.log(`Subscription verified/created for album listing - user: ${decodedToken.id}`, {
        subscriptionId: userSubscription._id,
        planType: userSubscription.planType,
        isActive: userSubscription.isActive
      });
      
      // Double check that subscription is active
      if (!userSubscription.isActive) {
        console.warn(`Subscription found but inactive for user: ${decodedToken.id}, activating...`);
        userSubscription.isActive = true;
        await userSubscription.save();
        console.log(`Subscription activated for user: ${decodedToken.id}`);
      }
    } catch (error) {
      console.error(`Error with subscription for album listing - user ${decodedToken.id}:`, error);
      return next(new BadRequestError("Failed to create or verify subscription"));
    }

    console.log(`Fetching albums for user: ${decodedToken.id}`);
    const albums = await Album.find({
      $or: [
        { user: decodedToken.id },
        ...(decodedToken.partnerId ? [{
          user: decodedToken.partnerId,
          isPrivate: false
        }] : [])
      ]
    }).populate(
      "photos coverPhoto"
    );

    // Get album count for subscription info
    const albumCount = await Album.countDocuments({ user: decodedToken.id });
    const maxAlbums = userSubscription.planType === 'free' ? 5 : 
                     userSubscription.planType === 'premium' ? 50 : 200;

    console.log(`Albums retrieved successfully for user: ${decodedToken.id}`, {
      albumCount: albums.length,
      userAlbumCount: albumCount,
      planType: userSubscription.planType,
      maxAlbums: maxAlbums
    });

    res.status(201).json({
      message: "Albums retrieved successfully",
      data: albums,
      subscriptionInfo: {
        planType: userSubscription.planType,
        currentAlbums: albumCount,
        maxAlbums: maxAlbums,
        remainingAlbums: maxAlbums - albumCount
      }
    });
  } catch (error) {
    console.error("Error creating album:", error);
    next(new BadRequestError((error as Error).message));
  }
};
