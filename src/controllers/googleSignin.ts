import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";
import { createToken } from "../helpers/createToken";
import verifyIdToken from "../helpers/verifyIdToken";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import generateUniqueInvitationCode from "../helpers/generateUniqueInvitationCode";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const googleSigninController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken, serverAuthCode, user } = req.body;
    const payload = await verifyIdToken(idToken);

    let existingUser = await User.findOne({ googleId: payload!.sub });

    if (!existingUser) {
      const emailExist = await User.findOne({ email: user.email });
      if (!emailExist) {
        axios
          .post("https://oauth2.googleapis.com/token", {
            code: serverAuthCode,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: "",
            grant_type: "authorization_code",
          })
          .then(async (response) => {
            const { refresh_token } = response.data;
            const userPartnerCode = await generateUniqueInvitationCode();
            existingUser = new User({
              googleId: payload!.sub,
              provider: "google",
              name: user.name,
              email: user.email,
              imageUrl: user.photo,
              refreshToken: refresh_token,
              partnerInvitationCode: userPartnerCode,
              isAdmin: false,
              isActive: true,
            });
            await existingUser.save();
            await new UserCreatedPublisher(natsWrapper.client).publish({
              id: existingUser._id,
              email: existingUser.email,
              provider: existingUser.provider,
              googleId: existingUser.googleId,
              name: existingUser.name,
              isActive: existingUser.isActive,
              isDeleted: existingUser.isDeleted,
              profilePic: existingUser.profilePic || "",
              version: existingUser.version,
            });

            const token = createToken(
              existingUser._id as unknown as string,
              existingUser.partnerId as unknown as string
            );
            res.status(200).json({
              user: existingUser,
              googleToken: idToken,
              token: token,
              _id: user._id,
              email: user.email,
              name: user.name,
            });
          })
          .catch((err) => {
            console.error(
              "Google Token Exchange Error:",
              err.response?.data || err.message
            );
            // next(new BadRequestError(`Geçersiz kimlik ${err}`));
            res.status(500).json("Geçersiz kimlik");
          });
      } else {
        res.status(500).json("Geçersiz kimlik doğrulama yöntemi");

        // next(new BadRequestError("Geçersiz kimlik doğrulama yöntemi"));
      }
    } else {
      const token = createToken(
        existingUser._id as unknown as string,
        existingUser.partnerId as unknown as string
      );
      res.status(200).json({
        user: existingUser,
        googleToken: idToken,
        token: token,
        _id: user._id,
        email: user.email,
        name: user.name,
      });
    }
  } catch (error) {
    console.log("Google Signin Error:", error);
    res.status(500).json("Geçersiz veya süresi dolmuş token");

    // next(new BadRequestError("Geçersiz veya süresi dolmuş token"));
    return;
  }
};

export default googleSigninController;
