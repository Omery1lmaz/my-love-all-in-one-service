import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import mongoose, { Mongoose } from "mongoose";

const clientId = "bee83f2e9bd54f76ac500edf670599f3";
const clientSecret = "062ee3fc313441c1972172287d724fe5";
const updateSharedSpotifyAlbumController = async (
  req: Request,
  res: Response
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const {
    albumId,
    albumLink,
    name,
    artists,
    images,
    releaseDate,
    totalTracks,
    label,
    genres,
    externalUrls,
    uri,
    type,
  }: {
    albumId: string;
    albumLink: string;
    name: string;
    artists: string[];
    images: { url: string; height: number; width: number }[];
    releaseDate: string;
    totalTracks: number;
    label?: string;
    genres?: string[];
    externalUrls: { spotify: string };
    uri: string;
    type: string;
  } = req.body;
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
    const partner = await User.findOne({
      _id: user.partnerId,
      partnerId: user._id,
    });
    if (partner) {
      partner.sharedSpotifyAlbum?.push({
        createdBy: user._id as any,
        albumId,
        albumLink,
        name,
        artists,
        images,
        releaseDate,
        totalTracks,
        label,
        genres,
        externalUrls,
        uri,
        type,
        addedAt: new Date(),
      });
      await partner.save();
    }
    user.sharedSpotifyAlbum?.push({
      createdBy: user._id as any,
      albumId,
      albumLink,
      name,
      artists,
      images,
      releaseDate,
      totalTracks,
      label,
      genres,
      externalUrls,
      uri,
      type,
      addedAt: new Date(),
    });
    await user.save();
    res.status(200).json({
      message: "Spotify token yenildi",
      status: "success",
      statusCode: 200,
      data: {
        sharedAlbums: user.sharedSpotifyAlbum,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateSharedSpotifyAlbumController;
