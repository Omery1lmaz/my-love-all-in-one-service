import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";
import verifyIdToken from "../helpers/verifyIdToken";
import jwt from "jsonwebtoken";
export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, otp, email, password } = req.params;

  try {
    const user = await User.findOne({ email, resetPasswordToken: token });

    if (!user) {
      next(
        new BadRequestError("Kullanıcı bulunamadı veya hesabı onaylanmamış.")
      );
      return;
    }

    const secret = process.env.RESET_PASSWORD_SECRET_KEY + "-" + user.password;

    jwt.verify(token, secret);

    if (
      user.resetPasswordOtpExpires &&
      user.resetPasswordOtpExpires < new Date(Date.now())
    ) {
      next(new BadRequestError("OTP süresi dolmuş."));
      return;
    }

    if (parseInt(user.resetPasswordOtp || "") !== parseInt(otp)) {
      next(new BadRequestError("Girdiğiniz OTP uyuşmuyor."));
      return;
    }
    user.password = password;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    res.status(200).json({
      message: "Şifre başarıyla değiştirildi.",
      success: true,
    });
  } catch (error) {
    next(new BadRequestError("Şifre değiştirme linki geçerli değil."));
    return;
  }
};

export default resetPasswordController;
