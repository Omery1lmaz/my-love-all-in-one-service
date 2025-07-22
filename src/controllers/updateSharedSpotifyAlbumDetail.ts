import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import mongoose, { Mongoose } from "mongoose";
import { BadRequestError } from "@heaven-nsoft/common";

const clientId = "bee83f2e9bd54f76ac500edf670599f3";
const clientSecret = "062ee3fc313441c1972172287d724fe5";
const updateSharedSpotifyAlbumDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const {
    name,
    label
  }: {
    name: string;
    label: string;
  } = req.body;
  const { id } = req.params;
  console.log(id, "id")
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
    const albumIndex = user.sharedSpotifyAlbum?.findIndex((item) => {
      return item.albumId == id;
    })
    console.log(albumIndex, "album index 1 tgest")
    if (partner) {
      const partnerAlbumIndex = partner.sharedSpotifyAlbum?.findIndex((item) => {
        return item.albumId == id;
      })

      if (partner.sharedSpotifyAlbum && partner.sharedSpotifyAlbum[partnerAlbumIndex as number]) {
        console.log(partner.sharedSpotifyAlbum[partnerAlbumIndex as number], "shared album before update")
        partner.sharedSpotifyAlbum[partnerAlbumIndex as number].name = name;
        partner.sharedSpotifyAlbum[partnerAlbumIndex as number].label = label;
        await partner.save();
        console.log(partner.sharedSpotifyAlbum[partnerAlbumIndex as number], "shared album before update")

      }
    }
    if (user.sharedSpotifyAlbum && user.sharedSpotifyAlbum[albumIndex as number]) {
      user.sharedSpotifyAlbum[albumIndex as number].name = name;
      user.sharedSpotifyAlbum[albumIndex as number].label = label;
    };
    await user.save();
    console.log((user.sharedSpotifyAlbum as unknown as any)[albumIndex as any], "shared album before update")
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

export default updateSharedSpotifyAlbumDetailController;
