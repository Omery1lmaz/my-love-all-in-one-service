import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const deleteSpotifyConnectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("no token");
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
      next(new NotFoundError());
      return;
    }

    // Kullanıcının kendi Spotify bilgilerini sil
    user.spotifyAccessToken = undefined;
    user.spotifyRefreshToken = undefined;
    user.spotifyAccessTokenExpires = undefined;

    // Eğer kullanıcının partneri varsa, partnerinin Spotify bilgilerini de sil
    if (user.partnerId) {
      const partner = await User.findById(user.partnerId);
      if (partner) {
        partner.partnerSpotifyAccessToken = undefined;
        partner.partnerSpotifyRefreshToken = undefined;
        partner.partnerSpotifyAccessTokenExpires = undefined;
        await partner.save();
      }
    }
    await user.save();

    res.status(200).json({
      message: "Spotify bağlantısı başarıyla silindi",
      status: "success",
      statusCode: 200,
      data: {
        spotifyDisconnected: true,
        dailySongsCleared: true,
        sharedAlbumsCleared: true,
        partnerSpotifyDisconnected: user.partnerId ? true : false,
      },
    });
  } catch (error) {
    console.log(error, "error");
    res
      .status(400)
      .json({ message: "Spotify bağlantısı silinirken hata oluştu" });
  }
};

export default deleteSpotifyConnectionController;
