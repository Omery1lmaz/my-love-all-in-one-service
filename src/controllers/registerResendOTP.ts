import { Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/decodedToken";
import { generateOTP } from "../helpers/generateOTP";
export const registerResendOTPController = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.query;
    const decodedToken = jwt.verify(
      token as string,
      process.env.SECRET_KEY as string
    ) as DecodedToken;

    const existUser = await User.findById(decodedToken.id);
    if (!existUser || existUser.isActive) {
      res.status(404).json({
        message: "User not found",
        success: false,
        data: null,
        error: true,
      });
      return;
    }

    const newOtp = generateOTP();
    existUser.otp = newOtp;
    existUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await existUser.save();

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
      data: null,
      error: false,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);

    res.status(400).json({
      message: "Invalid token or user not found",
      success: false,
      data: null,
      error: true,
    });
  }
};

export default registerResendOTPController;
