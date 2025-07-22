import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
export const resetPasswordSendEmailController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(400)
        .json({ message: "Kullanıcı bulunamadı veya hesabınız aktif değil." });
      return;
    }

    const otpToken = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP 10 dakika geçerli
    const maxAge = 3 * 24 * 60 * 60; // 3 gün

    const jwtPayload = { id: user._id, password: user.password };
    const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;

    const token = jwt.sign(jwtPayload, secret, { expiresIn: maxAge });

    user.resetPasswordToken = token;
    user.resetPasswordOtp = otpToken;
    user.resetPasswordOtpExpires = otpExpires;
    await user.save();

    const resetLink = `http://localhost:3000/users/${user._id}/reset-password/${token}`;
    const emailContent = `
      Şifrenizi değiştirmek için aşağıdaki bağlantıyı kullanabilirsiniz: 
      ${resetLink}
      
      Alternatif olarak, OTP kodunuzu kullanarak şifrenizi değiştirebilirsiniz: ${otpToken}
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
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

export default resetPasswordSendEmailController;
