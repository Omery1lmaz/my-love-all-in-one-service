import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotAuthorizedError, NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";
import { Photo } from "../Models/photo";
import { natsWrapper } from "../nats-wrapper";
import sharp from "sharp";
import { uploadToS3 } from "../utils/upload";
import { Timeline } from "../Models/timeline";

const uploadMultiPhotoTimelineController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("uploadMultiPhotoTimelineController");
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
      console.log("uploadMultiPhotoTimelineController err", err);
      next(new NotAuthorizedError());
      return;
    }

    if (!decodedToken?.id) {
      console.log("uploadMultiPhotoTimelineController decodedToken?.id");
      next(new NotAuthorizedError());
      return;
    }

    if (!req.files || !Array.isArray(req.files)) {
      console.log("uploadMultiPhotoTimelineController req.files", req.files);

      next(new BadRequestError("File upload failed"));
      return;
    }

    const {
      description = "",
      tags = [],
      musicUrl = "",
      note = "",
      location,
      coverPhotoFileName,
      timelineId,
    } = req.body;
    console.log("timelineId", timelineId);

    const uploadedPhotos = [];
    let coverPhotoId = null;
    for (const file of req.files) {
      console.log("file", file);

      const fileName = `${Date.now()}-${file.originalname}`;
      const thumbnailName = `thumb-${fileName}`;

      // Upload original and thumbnail to S3
      const [originalUrl, thumbnailUrl] = await Promise.all([
        uploadToS3(file.buffer, fileName, file.mimetype),
        sharp(file.buffer).resize({ width: 300 }).toBuffer().then((thumbBuffer: any) =>
          uploadToS3(thumbBuffer, thumbnailName, file.mimetype)
        ),
      ]);

      let locationData = null;
      if (location) {
        locationData = JSON.parse(location);
      }

      const newPhoto = new Photo({
        user: new mongoose.Types.ObjectId(),
        timeline: timelineId,
        url: originalUrl,
        thumbnailUrl,
        tags,
        musicUrl,
        note,
        location: locationData,
        isPrivate: false,
      });

      const savedPhoto = await newPhoto.save();
      uploadedPhotos.push(savedPhoto);
      if (coverPhotoFileName === file.originalname) {
        console.log(
          "coverPhotoFileName",
          coverPhotoFileName,
          file.originalname
        );
        coverPhotoId = savedPhoto._id;
      }
    }

    const timeline = await Timeline.findById(timelineId);
    if (!timeline) {
      console.log("timeline not found");
      next(new NotFoundError());
      return;
    }
    timeline.photos = uploadedPhotos.map((photo) => photo._id) as any;
    await timeline.save();

    console.log("cover photo id", coverPhotoId);
    res.status(201).json({
      message: "Photos uploaded successfully",
      uploadedPhotos: uploadedPhotos || [],
      coverPhotoId: coverPhotoId || null,
    });
  } catch (error) {
    console.error("Error creating photo:", error);
    next(new BadRequestError("Internal server error"));
    return;
  }
};

export default uploadMultiPhotoTimelineController;
