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
// import { AlbumCreatedEventPublisher } from "../events/publishers/album-created-publisher";

export const createAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("authHeader", authHeader);
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

    await album.save();
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
    });
  } catch (error) {
    console.error("Error creating album:", error);
    next(new BadRequestError((error as Error).message));
  }
};
