import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";
import { BadRequestError } from "@heaven-nsoft/my-love-common";

const getSharedSpotifyAlbumDetailController = async (req: Request, res: Response,next: NextFunction) => {
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
    const user = await User.findById(
      new mongoose.Types.ObjectId(decodedToken.id)
    );
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    const album = user.sharedSpotifyAlbum?.find(
      (item) => item.albumId === req.params.id
    );  
    if (!album) {
      next(new BadRequestError("Shared album not found"));
      return;
    }
    res.status(200).json({
      message: "shared abumlar getirildi",
      status: "success",
      statusCode: 200,
      data: {
        sharedAlbums: album,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default getSharedSpotifyAlbumDetailController;
