import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";

export const signinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // Kullanıcıyı email ile bul
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      next(new BadRequestError("Kullanıcı bulunamadı"));
      return;
    }

    if (user.provider !== "email") {
      next(new BadRequestError("Bu kullanıcı farklı bir sağlayıcıya bağlı"));
      return;
    }

    if (user.isDeleted) {
      next(new BadRequestError("Bu hesap silinmiştir"));
      return;
    }

    // Kullanıcı aktif mi?
    if (!user.isActive) {
      next(new BadRequestError("Lütfen emailinizi onaylayınız"));
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      next(new BadRequestError("Hesap bilgileri uyuşmuyor"));
      return;
    }

    const token = createToken(
      user._id as unknown as string,
      user.partnerId as unknown as string
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token: token,
    });
  } catch (error) {
    next(new BadRequestError("Hesap bilgileri uyuşmuyor"));
  }
};

export default signinController;
