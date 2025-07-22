import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";
import { BadRequestError } from "@heaven-nsoft/my-love-common";

const clientId = "bee83f2e9bd54f76ac500edf670599f3";
const clientSecret = "062ee3fc313441c1972172287d724fe5";
const refreshPartnerSpotifyTokenController = async (
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
    if (!user.partnerSpotifyRefreshToken) {
      next(
        new BadRequestError("there is no user partner's spotify refresh token")
      );
      return;
    }
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: `grant_type=refresh_token&refresh_token=${user.partnerSpotifyRefreshToken}`,
    });
    const data = await response.json();
    if (data.error) {
      res.status(400).json({ message: "Spotify token yenileme hatası" });
      return;
    }
    user.partnerSpotifyAccessToken = data.access_token;
    user.partnerSpotifyAccessTokenExpires = new Date(
      Date.now() + data.expires_in * 1000
    );
    await user.save();
    res.status(200).json({
      message: "Spotify token yenildi",
      status: "success",
      statusCode: 200,
      data: {
        spotifyAccessToken: user.partnerSpotifyAccessToken,
        spotifyAccessTokenExpires: user.partnerSpotifyAccessTokenExpires,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default refreshPartnerSpotifyTokenController;
