import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { createToken } from "../helpers/createToken";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
import generateUniqueInvitationCode from "../helpers/generateUniqueInvitationCode";
import { BadRequestError } from "@heaven-nsoft/my-love-common";
export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;
  try {
    console.log(name, email, password, req.body, "name email password")
    const existingUser = await User.findOne({ email, isActive: false });
    if (existingUser && existingUser.isActive) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const otpToken = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const userPartnerCode = await generateUniqueInvitationCode();
    if (existingUser && !existingUser?.isActive) {
      (existingUser.password = password),
        (existingUser.otp = otpToken),
        (existingUser.otpExpires = otpExpires),
        (existingUser.partnerInvitationCode = userPartnerCode),
        existingUser?.save();
      const token = createToken(
        existingUser._id as unknown as string,
        existingUser.partnerId as unknown as string
      );
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Onayı",
        text: `Here is your OTP token: ${otpToken}`,
      });
      res.status(201).json({
        message: "Emailinizi onaylayınız",
        token,
      });
      return;
    }
    const newUser = new User({
      name,
      email,
      password,
      otp: otpToken,
      otpExpires,
      partnerInvitationCode: userPartnerCode,
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Onayı",
      text: `Here is your OTP token: ${otpToken}`,
    });

    const token = createToken(
      newUser._id as unknown as string,
      newUser.partnerId as unknown as string
    );
    res.status(201).json({
      message: "Emailinizi onaylayınız",
      token,
    });
  } catch (error) {
    console.error("Kayıt sırasında hata oluştu:", error);
    next(new BadRequestError("Kayıt sırasında hata oluştu"));
    await User.findOneAndDelete({ email: email })
  }
};

export default signupController;
