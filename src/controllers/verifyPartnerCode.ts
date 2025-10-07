import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";
import { DecodedToken } from "../types/decodedToken";
import { UserActivatedPublisher } from "../events/publishers/user-activated-publisher";
import { natsWrapper } from "../nats-wrapper";
import { UserPartnerUpdatedPublisher } from "../events/publishers/user-partner-updated-publisher copy";

export const verifyPartnerCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.params;
  console.log("token otp", otp);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("no token");
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.SECRET_KEY as string
    ) as DecodedToken;
    
    const user = await User.findById(decodedToken.id);
    if (!user) {
      console.log("user yok");
      next(new BadRequestError("Kullanıcı yok"));
      return;
    }

    // Kullanıcının kendi invitation code'unu kullanmasını engelle
    if (user.partnerInvitationCode === parseInt(otp)) {
      next(new BadRequestError("Kendi partner kodunuzu kullanamazsınız"));
      return;
    }

    const partner = await User.findOne({
      partnerInvitationCode: parseInt(otp),
    });
    if (!partner) {
      console.log("partner yok");
      next(new BadRequestError("Partner kodu yanlış"));
      return;
    }
    if (partner.partnerId) {
      next(new BadRequestError("Partner kodu zaten kullanıldı"));
      return;
    }

    if (partner.partnerInvitationCode !== parseInt(otp)) {
      console.log("otp yanlış");
      next(new BadRequestError("Girdiğiniz OTP uyuşmuyor"));
      return;
    }
    // Kullanıcı aktif hale getiriliyor
    user.partnerId = partner._id;
    user.partnerName = partner.name;
    partner.partnerName = user.name;
    partner.partnerId = user._id;
    await user.save();
    await partner.save();

    await new UserPartnerUpdatedPublisher(natsWrapper.client).publish({
      userId: user._id,
      partnerId: partner._id,
      version: user.version,
    });
    res.status(201).json({
      isVerify: true,
      message: "Hesabınız Onaylandı",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err);
    next(new BadRequestError("Token geçersiz veya kullanıcı yok"));
  }
};

export default verifyPartnerCodeController;
