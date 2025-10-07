import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../Models/user";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
export const resetPasswordLastVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("test deneme reset password");
    const authHeader = req.headers.authorization;
    const { newPassword, newPasswordConfirm } = req.body;
    if (newPassword !== newPasswordConfirm) {
      console.log("şifreler eşleşmiyor");
      return next(new BadRequestError("Şifreler eşleşmiyor"));
    }
    if (!authHeader) {
      console.log("token yok");
      return next(new NotAuthorizedError());
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
        title: string;
      };
    } catch {
      console.log("token geçersiz");
      return next(new NotAuthorizedError());
    }

    if (!decodedToken?.id) {
      console.log("user id yok");
      return next(new BadRequestError("User ID not found"));
    }

    const user = await User.findById(decodedToken.id);

    if (!user) {
      console.log("user yok");

      next(
        new BadRequestError("Kullanıcı bulunamadı veya hesabınız aktif değil.")
      );
      return;
    }

    const otpToken = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP 10 dakika geçerli
    console.log("otpToken", otpToken);
    console.log("otpExpires", otpExpires);
    // const jwtPayload = { id: user._id, password: user.password };
    // const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;

    // const token = jwt.sign(jwtPayload, secret, { expiresIn: maxAge });
    console.log("yeni şifre var");
    user.resetPasswordToken = decodedToken.id;
    user.resetPasswordOtp = otpToken;
    user.resetPasswordOtpExpires = otpExpires;
    user.newPassword = newPassword;
    await user.save();

    const resetLink = `http://localhost:3000/users/${user._id}/reset-password/${decodedToken.id}`;
    const emailContent = `
      Şifrenizi değiştirmek için aşağıdaki bağlantıyı kullanabilirsiniz: 
      ${resetLink}
      
      Alternatif olarak, OTP kodunuzu kullanarak şifrenizi değiştirebilirsiniz: ${otpToken}
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Şifre Değiştirme Talebi",
      text: emailContent,
    });

    res.status(200).json({
      message: "Şifre değiştirme bağlantısı e-posta adresinize gönderildi.",
      data: { token },
      isSuccess: true,
      isError: false,
    });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    res
      .status(500)
      .json({ message: "Bir hata oluştu, lütfen tekrar deneyiniz." });
  }
};

export default resetPasswordLastVersionController;
