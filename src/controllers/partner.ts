import { Request, Response } from "express";
import { User } from "../Models/user";
import { NotFoundError } from "@heaven-nsoft/common";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const updatePartnerInfo = async (req: Request, res: Response) => {

  const authHeader = req.headers.authorization;
  const { nickname } = req.body;
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
    const user = await User.findById(decodedToken.id).populate("partnerId")
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    console.log(user.partnerId, "partner id test deneme")
    if (user.partnerId) {
      const existPartner = await User.findById((user.partnerId as any)._id)
      if (existPartner) {
        existPartner.nickname = nickname
        await existPartner.save()
      }
    }

    user.partnerNickname = nickname || user.partnerNickname;

    await user.save();

    res.status(200).json({
      data: user.partnerNickname,
      success: "OK",
      statusCode: 201
    });
  } catch (error) {
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
