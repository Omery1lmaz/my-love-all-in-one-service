import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { createToken } from "../helpers/createToken";
import { generateOTP } from "../helpers/generateOTP";
import transporter from "../utils/mailTransporter";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import generateUniqueInvitationCode from "../helpers/generateUniqueInvitationCode";
import { BadRequestError } from "@heaven-nsoft/my-love-common";
export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email, isActive: false });
    if (existingUser && existingUser.isActive) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const otpToken = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const userPartnerCode = await generateUniqueInvitationCode();
    if (!existingUser) {
      next(new BadRequestError("Kullanıcı bulunamadı"));
      return;
    }
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
      existingUser._id as unknown as string,
      existingUser.partnerId as unknown as string
    );
    await new UserCreatedPublisher(natsWrapper.client).publish({
      id: newUser._id,
      email: newUser.email,
      provider: newUser.provider,
      googleId: newUser.googleId,
      name: newUser.name,
      isActive: newUser.isActive,
      isDeleted: newUser.isDeleted,
      profilePic: newUser.profilePic || "",
      version: newUser.version,
    });
    res.status(201).json({
      message: "Emailinizi onaylayınız",
      token,
    });
  } catch (error) {
    console.error("Kayıt sırasında hata oluştu:", error);
    res.status(500).json({ message: "Sunucu hatası, lütfen tekrar deneyin" });
  }
};

export default signupController;
