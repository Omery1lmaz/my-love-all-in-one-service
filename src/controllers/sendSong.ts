import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
export const sendSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      images,
      name,
      artists,
      external_urls,
      spotifyTrackId,
      spotifyArtist,
      spotifyAlbum,
      // song: song,
      message,
    } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Lütfen giriş yapın" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(400).json({ message: "Token bulunamadı" });
      return;
    }
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
      };
      const user = await User.findById(decodedToken.id);
      if (!user) {
        next(new NotAuthorizedError());
        return;
      }
      

      
      // Add today's song
      const newSong = {
        addedAt: new Date(),
        date: new Date(Date.now()),
        external_urls: external_urls,
        id: spotifyTrackId,
        images: images,
        name: name,
        spotifyAlbum: spotifyAlbum,
        spotifyArtist: spotifyArtist,
        spotifyTrackId: spotifyTrackId,
        chosenBy: user._id,
        message: message || "",
      };

      user.sendedMusic = user.sendedMusic || [];
      user.sendedMusic.push(newSong);
      if (user.partnerId) {
        const partner = await User.findById(user.partnerId);
        if (partner) {
          partner.sendedMusic = partner.sendedMusic || [];
          partner.sendedMusic.push(newSong);
          await partner.save();
        }
      }
      await user.save();
      res
        .status(200)
        .send({ message: "Today's song has been set.", song: newSong });
    } catch (error) {
      next(new NotAuthorizedError());
      return;
    }
  } catch (err) {
    console.error(err);
    next(new BadRequestError("An unexpected error occurred."));
  }
};
