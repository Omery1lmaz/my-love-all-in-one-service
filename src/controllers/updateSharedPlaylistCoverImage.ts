import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "@heaven-nsoft/my-love-common";
const updateSharedPlaylistCoverImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const { images } = req.body;
  const { id } = req.params;
  console.log("test images test")
  if (!authHeader) {
    console.log("no authHeader");
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
    console.log(decodedToken, "decoded token");
    const user = await User.findById(
      new mongoose.Types.ObjectId(decodedToken.id)
    );
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    if(user.partnerId) {
      const partner = await User.findOne({
        _id: user.partnerId,
        partnerId: user._id,
      });
      if(partner) {
        const partnerAlbumIndex = partner.sharedSpotifyAlbum?.findIndex((item) => {
        return item.albumId == id;
      });
        if (partner.sharedSpotifyAlbum && partner.sharedSpotifyAlbum[partnerAlbumIndex as number]) {
        partner.sharedSpotifyAlbum[partnerAlbumIndex as number].images = images;
        await partner.save();
      }
      }

    }
    console.log(user.sharedSpotifyAlbum, id,)
    const existsharedAlbumIndex = user.sharedSpotifyAlbum?.findIndex(
      (item) => item.albumId === id
    );
    if (
      existsharedAlbumIndex === undefined ||
      existsharedAlbumIndex < 0 ||
      !user.sharedSpotifyAlbum ||
      !user.sharedSpotifyAlbum[existsharedAlbumIndex]
    ) {
      console.log(`[Album Error] Shared album not found for albumId: ${id}`);
      next(new BadRequestError("[Album Error] Shared album not found for albumId"));
      return;
    }

    user.sharedSpotifyAlbum[existsharedAlbumIndex].images = images;
    user.save()
    res.status(200).json({
      message: "Album cover photo updated",
      status: "success",
      statusCode: 200,
      data: {
        albums: user.sharedSpotifyAlbum
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateSharedPlaylistCoverImageController;
