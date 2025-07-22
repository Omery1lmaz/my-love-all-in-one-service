import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const detailsController = async (req: Request, res: Response) => {
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
    ).populate("partnerId")
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      nickName: user.nickname || "",
      partnerName: user.partnerName || "",
      partnerNickname: user.partnerNickname,
      profilePic: user.profilePhoto || "",
      partnerProfilePic: user.partnerId ? (((user.partnerId) as any).profilePhoto) : ""
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default detailsController;
