import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../Models/user";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
import { BadRequestError, NotAuthorizedError } from "@heaven-nsoft/common";
export const applyResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("test deneme reset password applt");
    const authHeader = req.headers.authorization;
    const { otpToken } = req.body;
    if (!authHeader) {
      console.log("authHeader yok");
      next(new NotAuthorizedError());
      return;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
        title: string;
      };
    } catch {
      console.log("decodedToken yok");
      next(new NotAuthorizedError());
      return;
    }

    if (!decodedToken?.id) {
      console.log("decodedToken.id yok");
      next(new BadRequestError("User ID not found"));
      return;
    }

    const user = await User.findById(decodedToken.id);

    if (!user) {
      console.log("user yok");
      next(
        new BadRequestError("Kullanıcı bulunamadı veya hesabınız aktif değil.")
      );
      return;
    }

    // const jwtPayload = { id: user._id, password: user.password };
    // const secret = `${process.env.RESET_PASSWORD_SECRET_KEY}-${user.password}`;

    // const token = jwt.sign(jwtPayload, secret, { expiresIn: maxAge });

    const existsResetPasswordOtpExpires = user.resetPasswordOtpExpires;
    const existsResetPasswordToken = user.resetPasswordOtp;
    console.log("user resetPasswordOtp", user.resetPasswordOtp);
    console.log("otpToken", otpToken);
    if (otpToken !== user.resetPasswordOtp) {
      console.log("otpToken !== user.resetPasswordOtp", otpToken, user.resetPasswordOtp);
      next(new BadRequestError("OTP uyuşmuyor."));
      return;
    }
    // Token'ın ve son kullanma tarihinin kontrolü
    if (
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires < new Date()
    ) {
      console.log("user.resetPasswordOtpExpires < new Date()");
      next(
        new BadRequestError(
          "Şifre sıfırlama tokenı süresi dolmuş veya geçersiz."
        )
      );
      return;
    }
    if (!user.newPassword) {
      console.log("user.newPassword");
      next(new BadRequestError("Yeni şifre bulunamadı."));
      return;
    }
    if (existsResetPasswordOtpExpires) {
      console.log("existsResetPasswordOtpExpires");
      user.resetPasswordOtpExpires = undefined;
    }
    if (existsResetPasswordToken) {
      user.resetPasswordOtp = undefined;
    }
    if (existsResetPasswordToken) {
      console.log("existsResetPasswordToken");
      user.resetPasswordOtp = undefined;
    }
    user.password = user.newPassword;
    console.log("user.password = user.newPassword");
    user.newPassword = undefined;
    await user.save();
    console.log("user.save");
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

export default applyResetPasswordController;
