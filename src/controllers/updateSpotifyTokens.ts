import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const updateSpotifyTokensController = async (
  req: Request,
  res: Response
) => {
  const authHeader = req.headers.authorization;
  const { spotifyAccessToken, spotifyRefreshToken, spotifyAccessTokenExpires } =
    req.body;
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
    const partner = await User.findById(user.partnerId);
    if (partner) {
      partner.partnerSpotifyAccessToken = spotifyAccessToken;
      partner.partnerSpotifyRefreshToken = spotifyRefreshToken;
      partner.partnerSpotifyAccessTokenExpires = spotifyAccessTokenExpires;
      await partner.save();
    }
    user.spotifyAccessToken = spotifyAccessToken;
    user.spotifyRefreshToken = spotifyRefreshToken;
    user.spotifyAccessTokenExpires = spotifyAccessTokenExpires;
    await user.save();
    res.status(200).json({
      message: "Spotify tokenları güncellendi",
      status: "success",
      statusCode: 200,
      data: {
        spotifyAccessToken: user.spotifyAccessToken,
        spotifyRefreshToken: user.spotifyRefreshToken,
        spotifyAccessTokenExpires: user.spotifyAccessTokenExpires,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateSpotifyTokensController;
