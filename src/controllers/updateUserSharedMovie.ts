import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const updateSharedUserMovieController = async (
  req: Request,
  res: Response
) => {
  const authHeader = req.headers.authorization;
  const { movie, note, isShared } = req.body;
  console.log(
    movie, "movie"
  )
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
    const updateMovie = {
      isShared,
      note,
      movie,
      createdBy: "me"
    }
    console.log(updateMovie, "updateMovie")
    console.log(isShared, "isShared")
    user.sharedMovies.push({
      isShared,
      note,
      movie,
      createdBy: "me"
    });
    await user.save();

    // Eğer isShared true ise partnerin sharedMovies'ine de ekle
    if (isShared && user.partnerId) {
      const partner = await User.findById(user.partnerId);
      if (partner) {
        partner.sharedMovies.push({
          isShared: isShared || false,
          note,
          movie,
          createdBy: "partner"
        });
        await partner.save();
      }
    }
    res.status(200).json({
      message: "Sorular güncellendi",
      status: "success",
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateSharedUserMovieController;
