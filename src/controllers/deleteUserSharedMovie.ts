import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import mongoose from "mongoose";

export const deleteSharedUserMovieController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("test deneme")
  const authHeader = req.headers.authorization;
  const { id } = req.params
  console.log("id", id)
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
    const movieDetail = user.sharedMovies.find((movie: any) => movie._id == id)
    if (!movieDetail) {
      next(new BadRequestError("The movie doesn't exist"))
      return
    }
    // Filmi sharedMovies listesinden çıkar
    user.set('sharedMovies', user.sharedMovies.filter((movie: any) => movie._id != id));
    await user.save();
    // Eğer isShared true ise partnerin sharedMovies'ine de ekle
    res.status(200).json({
      message: "Film silindi",
      status: "success",
      statusCode: 200,
      data: movieDetail,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default deleteSharedUserMovieController;
