import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const updateUserProfileDetailsController = async (
  req: Request,
  res: Response
) => {
  const authHeader = req.headers.authorization;
  const { surName, birthDate, gender } = req.body;
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
    if (!req.file) {
      console.log("File upload failed req.file");
      res.status(400).json({ message: "File upload failed" });
      return;
    }
    user.surname = surName;
    user.birthDate = birthDate;
    user.gender = gender;
    user.profilePhoto = (req.file as any).location;
    await user.save();
    res.status(200).json({
      message: "Profil bilgileri güncellendi",
      status: "success",
      statusCode: 200,
      data: {
        birthDate: user.birthDate,
        gender: user.gender,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateUserProfileDetailsController;
