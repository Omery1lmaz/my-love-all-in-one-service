import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import bcrypt from "bcrypt";
import { DecodedToken } from "../types/decodedToken";

export const updatePasswordController = async (req: Request, res: Response) => {
  console.log("updatePasswordController");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("Lütfen giriş yapınız.");
      res.status(401).json({ message: "Lütfen giriş yapınız." });
      return;
    }
    
    const token = authHeader.split(" ")[1];
    console.log("token", token);
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY as string);
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;

    if (!newPassword || !newPasswordConfirm || !oldPassword) {
      console.log("Lütfen tüm alanları doldurunuz.");
      res.status(400).json({ message: "Lütfen tüm alanları doldurunuz." });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      console.log("Yeni şifreler eşleşmiyor.");
      res.status(400).json({ message: "Yeni şifreler eşleşmiyor." });
      return;
    }

    const user = await User.findOne({
      _id: (decodedToken as DecodedToken).id,
      provider: "email",
    });

    if (!user || !user.isActive) {
      console.log("Hesabınızı aktif etmelisiniz.");
      res.status(403).json({ message: "Hesabınızı aktif etmelisiniz." });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password || "");
    if (!isMatch) {
      console.log("Eski şifreniz yanlış.");
      res.status(400).json({ message: "Eski şifreniz yanlış." });
    }

    if (oldPassword === newPassword) {
      console.log("Eski şifreniz yeni şifreniz ile aynı olamaz.");
      res
        .status(400)
        .json({ message: "Eski şifreniz yeni şifreniz ile aynı olamaz." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Şifreniz başarıyla güncellendi." });
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    console.error("Timestamp:", new Date().toISOString());
    console.error("Error Type:", error?.constructor?.name || "Unknown");
    console.error("Request Body:", req.body);
    console.error("Request Headers:", req.headers);
    console.error("Request Cookies:", req.cookies);
    console.error("================================");
    res
      .status(500)
      .json({ message: "Bir hata oluştu, lütfen tekrar deneyiniz." });
  }
};

export default updatePasswordController;
