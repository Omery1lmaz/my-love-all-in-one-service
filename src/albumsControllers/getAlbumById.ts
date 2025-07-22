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

export const getAlbumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const { id } = req.params;
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
      next(new BadRequestError("Album ID is required"));
      return;
    }
    console.log(decodedToken.id, "decodedToken.id");
    const album = await Album.findOne({
      _id: id,
      user: decodedToken.id,
    }).populate("photos coverPhoto");
    if (!album) {
      console.log("album", album);
      next(new BadRequestError("Album not found"));
      return;
    }

    res.status(200).json({
      message: "Album fetched successfully",
      data: album,
    });
  } catch (error) {
    console.error("Error fetching album:", error);
    next(new BadRequestError((error as Error).message));
  }
};

export default getAlbumById;
