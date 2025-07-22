import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";
import { DecodedToken } from "../types/decodedToken";
import { UserActivatedPublisher } from "../events/publishers/user-activated-publisher";
import { natsWrapper } from "../nats-wrapper";
import { UserPartnerUpdatedPublisher } from "../events/publishers/user-partner-updated-publisher copy";

export const verifyRegisterPartnerCodeController = async (
  req: Request,
  res: Response
) => {
  const { token, otp } = req.params;
  console.log("token otp", token, otp);
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.SECRET_KEY as string
    ) as DecodedToken;
    console.log(decodedToken, "decoded token");
    const partner = await User.findOne({
      partnerInvitationCode: parseInt(otp),
    });
    if (!partner) {
      console.log("partner yok");
      res.status(400).json({
        message: "Partner kodu yanlış",
      });
      return;
    }
    if (partner.partnerId) {
      res.status(400).json({
        message: "Partner kodu zaten kullanıldı",
      });
      return;
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      console.log("user yok");
      res.status(400).json({
        isVerify: true,
        message: "Kullanıcı yok",
      });
      return;
    }

    if (partner.partnerInvitationCode !== parseInt(otp)) {
      console.log("otp yanlış");
      res.status(400).json({
        message: "Girdiğiniz OTP uyuşmuyor",
      });
      return;
    }
    // Kullanıcı aktif hale getiriliyor
    user.partnerId = partner._id;
    user.partnerName = partner.name;
    partner.partnerName = user.name
    partner.partnerId = user._id;
    await user.save();
    await partner.save();

    console.log("partner ve user kaydedildi");
    // Token oluşturuluyor
    const newToken = createToken(
      user._id as unknown as string,
      user.partnerId as unknown as string
    );
    res.cookie("token", newToken);
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

export default verifyRegisterPartnerCodeController;
