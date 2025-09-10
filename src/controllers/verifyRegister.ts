import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";
import { DecodedToken } from "../types/decodedToken";
import { UserActivatedPublisher } from "../events/publishers/user-activated-publisher";
import { natsWrapper } from "../nats-wrapper";

export const verifyRegisterController = async (req: Request, res: Response) => {
  const { token, otp } = req.params;
  console.log("token otp", token, otp);
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.SECRET_KEY as string
    ) as DecodedToken;

    const user = await User.findById(decodedToken.id);
    console.log("user", user?.otp);
    if (!user) {
      console.log("user yok");
      res.status(400).json({
        isVerify: true,
        message: "Kullanıcı yok",
      });
      return;
    }

    if (user.isActive) {
      console.log("user aktif");
      res.status(201).json({
        isVerify: true,
        message: "Kullanıcı Emaili onaylandı",
      });
      return;
    }

    if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      console.log("otp süresi dolmuş");
      res.status(400).json({
        isVerify: true,
        message: "Otp süresi dolmuş",
      });
      return;
    }

    if (parseInt(user.otp || "") !== parseInt(otp)) {
      console.log("otp yanlış");
      res.status(400).json({
        message: "Girdiğiniz OTP uyuşmuyor",
      });
      return;
    }

    // Kullanıcı aktif hale getiriliyor
    await User.findOneAndUpdate(
      { email: user.email },
      { isActive: true, otp: null, otpExpires: null }
    );
    console.log("user updated", user);
    const newToken = createToken(
      user._id as unknown as string,
      user.partnerId as unknown as string
    );
    res.cookie("token", newToken);

    res.status(201).json({
      isVerify: true,
      message: "Hesabınız Onaylandı",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        token: newToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      isVerify: true,
      message: "Token geçersiz veya kullanıcı yok",
    });
  }
};

export default verifyRegisterController;
