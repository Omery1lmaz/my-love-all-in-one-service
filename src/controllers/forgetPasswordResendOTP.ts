import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
import { DecodedToken } from "../types/decodedToken";

export const forgetPasswordResendOTPController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, email } = req.query;

  try {
    const existUser = await User.findOne({ email });

    if (!existUser) {
      res.status(404).send({
        message: "User not found",
        success: false,
        data: null,
        error: true,
      });
      return;
    }

    const secret =
      process.env.RESET_PASSWORD_SECRET_KEY + "-" + existUser.password;
    try {
      const decodedToken = jwt.verify(
        token as string,
        secret as string
      ) as DecodedToken;
      if (!decodedToken?.id || decodedToken.id !== existUser._id.toString()) {
        next(new BadRequestError("Invalid token"));
      }
    } catch (error) {
      res.status(400).json({
        message: "Invalid or expired reset password link",
        success: false,
        data: null,
        error: true,
      });
    }
    const jwtInfos = {
      id: existUser._id,
      password: existUser.password,
    };
    const maxAge = 3 * 24 * 60 * 60;
    const newToken = jwt.sign(jwtInfos, secret, { expiresIn: maxAge });
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    existUser.resetPasswordOtp = otp;
    existUser.resetPasswordOtpExpires = otpExpires;
    existUser.resetPasswordToken = newToken;
    await existUser.save();
    const url = `http://localhost:3000/users/${existUser._id}/reset-password/${newToken}
    and if you want to change password with OTP token, here is your OTP: "${otp}"`;
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email as string,
      subject: "Şifre Değiştirme",
      text: url,
    });

    res.status(200).send({
      message: "OTP sent successfully",
      success: true,
      data: {
        token: newToken,
      },
      error: false,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);

    res.status(500).send({
      message: "Internal server error",
      success: false,
      data: null,
      error: true,
    });
  }
};

export default forgetPasswordResendOTPController;
