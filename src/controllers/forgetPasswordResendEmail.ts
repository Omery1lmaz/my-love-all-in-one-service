import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
import { DecodedToken } from "../types/decodedToken";

export const forgetPasswordResendEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, email } = req.query;
  console.log("token", token);
  console.log("email", email);
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

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    existUser.resetPasswordOtp = otp;
    existUser.resetPasswordOtpExpires = otpExpires;
    await existUser.save();
    const url = `
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
      data: {},
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

export default forgetPasswordResendEmailController;
