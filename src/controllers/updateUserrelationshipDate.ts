import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";

export const updateUserRelationshipDateController = async (
  req: Request,
  res: Response
) => {
  const authHeader = req.headers.authorization;
  const { relationshipStartDate } = req.body;
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
    const relationshipDate = new Date(relationshipStartDate);
    const partner = await User.findById(user.partnerId);
    if (partner) {
      partner.relationshipStartDate = relationshipDate;
      await partner.save();
      res.status(404).json({ message: "Partner bulunamadı" });
      return;
    }
    user.relationshipStartDate = relationshipDate;
    await user.save();
    res.status(200).json({
      message: "İlişki başlangıç tarihi güncellendi",
      status: "success",
      statusCode: 200,
      data: user.relationshipStartDate,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export default updateUserRelationshipDateController;
