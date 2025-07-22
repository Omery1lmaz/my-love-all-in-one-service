import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import {
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
export const createTodaySongController = async (
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
      // Check if a song is already set for today
      const today = new Date().toISOString().split("T")[0];

      const hasSongForToday = user.dailySong?.find((song) => {
        const songDate = new Date(song.date).toISOString().split("T")[0];
        const songChoosen = song.chosenBy?.toString() === user._id.toString();
        return songDate === today && songChoosen;
      });

      if (hasSongForToday) {
        next(new BadRequestError("You already have a song for today."));
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

      // Push to dailySongHistory
      user.dailySong = user.dailySong || [];
      user.dailySong.push(newSong);
      if (user.partnerId) {
        const partner = await User.findById(user.partnerId);
        if (partner) {
          partner.dailySong = partner.dailySong || [];
          partner.dailySong.push(newSong);
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
