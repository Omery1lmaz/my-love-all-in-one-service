import { Publish } from "./../../node_modules/aws-sdk/clients/stepfunctions.d";
import { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/my-love-common";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { natsWrapper } from "../nats-wrapper";
import { Album } from "../Models/album";
import { Subscription } from "../Models/subscription";
import { StorageService } from "../services/storageService";
// import { AlbumCreatedEventPublisher } from "../events/publishers/album-created-publisher";

export const createAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    const {
      name,
      description,
      event,
      isPrivate,
      categories,
      location,
      allowCollaboration,
      startDate,
      endDate,
      musicDetails,
    } = req.body;

    if (!name) {
      console.log("no name");
      throw new BadRequestError("Album name is required");
    }

    // Ensure user has a subscription (create default if not exists)
    console.log(`Ensuring subscription exists for album creation - user: ${decodedToken.id}`);
    let userSubscription;
    try {
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(decodedToken.id)
      );
      console.log(`Subscription verified/created for album creation - user: ${decodedToken.id}`, {
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
      console.error(`Error with subscription for album creation - user ${decodedToken.id}:`, error);
      return next(new BadRequestError("Failed to create or verify subscription"));
    }

    // Check if user can create more albums (basic check)
    const existingAlbums = await Album.countDocuments({ user: decodedToken.id });
    console.log(`Album count check for user: ${decodedToken.id}`, {
      existingAlbums,
      planType: userSubscription.planType
    });

    // Basic album limit check (can be enhanced based on plan)
    const maxAlbums = userSubscription.planType === 'free' ? 5 : 
                     userSubscription.planType === 'premium' ? 50 : 200;
    
    if (existingAlbums >= maxAlbums) {
      console.error(`Album limit exceeded for user: ${decodedToken.id}`, {
        existingAlbums,
        maxAlbums,
        planType: userSubscription.planType
      });
      return next(new BadRequestError(`Album limit exceeded. You can create up to ${maxAlbums} albums with your current plan.`));
    }

    console.log(`Album creation allowed for user: ${decodedToken.id}`, {
      existingAlbums,
      maxAlbums,
      planType: userSubscription.planType
    });

    // Create new album with direct values
    const album = new Album({
      user: decodedToken.id as any,
      name,
      description,
      event,
      isPrivate: isPrivate === "true",
      categories: Array.isArray(categories) ? categories : [],
      location,
      musicDetails: musicDetails || null,
      allowCollaboration: allowCollaboration === "true",
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      photos: [],
      sizeInMB: 0,
      collaborators: [],
    });

    console.log(`Saving album for user: ${decodedToken.id}`);
    await album.save();
    
    console.log(`Album created successfully for user: ${decodedToken.id}`, {
      albumId: album._id,
      albumName: album.name,
      planType: userSubscription.planType,
      remainingAlbums: maxAlbums - (existingAlbums + 1)
    });

    // await new AlbumCreatedEventPublisher(natsWrapper.client).publish({
    //   id: (album._id as any).toString(),
    //   version: album.__v,
    //   allowCollaboration: album.allowCollaboration,
    //   categories: album.categories,
    //   collaborators: album.collaborators,
    //   coverPhoto: album.coverPhoto,
    //   description: album.description,
    //   event: album.event,
    //   isPrivate: album.isPrivate,
    //   location: album.location,
    //   musicDetails: album.musicDetails,
    //   name: album.name,
    //   sizeInMB: album.sizeInMB,
    //   user: album.user,
    // });
    
    res.status(201).json({
      message: "Album created successfully",
      data: album,
      subscriptionInfo: {
        planType: userSubscription.planType,
        remainingAlbums: maxAlbums - (existingAlbums + 1),
        maxAlbums: maxAlbums
      }
    });
  } catch (error) {
    console.error("Error creating album:", error);
    next(new BadRequestError((error as Error).message));
  }
};
