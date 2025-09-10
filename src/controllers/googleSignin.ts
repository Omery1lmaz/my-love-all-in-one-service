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
  console.log("=== Google Signin Controller Started ===");
  console.log(req.body, "req.body coming")
  console.log("Request Body:", {
    idToken: req.body.idToken ? "Present" : "Missing",
    serverAuthCode: req.body.serverAuthCode ? "Present" : "Missing",
    user: req.body.user ? "Present" : "Missing"
  });

  try {
    const { idToken, serverAuthCode, user } = req.body;
    console.log("Extracted data:", {
      hasIdToken: !!idToken,
      hasServerAuthCode: !!serverAuthCode,
      userEmail: user?.email
    });

    // Validate required fields
    if (!idToken) {
      console.error("ERROR: idToken is missing from request body");
      res.status(400).json({ error: "idToken is required" });
      return
    }

    if (!user || !user.email) {
      console.error("ERROR: user data or email is missing from request body");
      res.status(400).json({ error: "User data and email are required" });
      return
    }

    console.log("Verifying ID token...");
    const payload = await verifyIdToken(idToken);
    console.log("ID token verified successfully, payload sub:", payload?.sub);

    console.log("Checking for existing user with googleId:", payload?.sub);
    let existingUser = await User.findOne({ googleId: payload!.sub });
    console.log("Database query result for googleId:", existingUser ? "User found" : "No user found");

    if (!existingUser) {
      console.log("No existing user found with googleId, checking email...");
      const emailExist = await User.findOne({ email: user.email });
      console.log("Database query result for email:", emailExist ? "Email exists" : "Email not found");

      if (!emailExist) {
        console.log("No user found with email, creating new user...");

        // Validate serverAuthCode for new user creation
        if (!serverAuthCode) {
          console.error("ERROR: serverAuthCode is required for new user creation");
          res.status(400).json({ error: "serverAuthCode is required for new user creation" });
          return
        }

        console.log("Making Google OAuth token exchange request...");
        console.log("OAuth request details:", {
          hasServerAuthCode: !!serverAuthCode,
          hasClientId: !!googleClientId,
          hasClientSecret: !!googleClientSecret
        });

        axios
          .post("https://oauth2.googleapis.com/token", {
            code: serverAuthCode,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: "",
            grant_type: "authorization_code",
          })
          .then(async (response) => {
            console.log("Google OAuth token exchange successful");
            console.log("OAuth response status:", response.status);
            const { refresh_token } = response.data;
            console.log("Refresh token received:", refresh_token ? "Present" : "Missing");

            console.log("Generating unique invitation code...");
            const userPartnerCode = await generateUniqueInvitationCode();
            console.log("Generated invitation code:", userPartnerCode);

            console.log("Creating new user object...");
            const newUserData = {
              googleId: payload!.sub,
              provider: "google",
              name: user.name,
              email: user.email,
              imageUrl: user.photo,
              refreshToken: refresh_token,
              partnerInvitationCode: userPartnerCode,
              isAdmin: false,
              isActive: true,
            };
            console.log("New user data prepared:", {
              googleId: newUserData.googleId,
              email: newUserData.email,
              name: newUserData.name,
              hasImageUrl: !!newUserData.imageUrl,
              hasRefreshToken: !!newUserData.refreshToken,
              hasPartnerCode: !!newUserData.partnerInvitationCode
            });

            existingUser = new User(newUserData);

            console.log("Saving new user to database...");
            await existingUser.save();
            console.log("User saved successfully, ID:", existingUser._id);
            console.log("User version after save:", existingUser.version);

            console.log("Publishing UserCreated event...");
            const eventData = {
              id: existingUser._id,
              email: existingUser.email,
              provider: existingUser.provider,
              googleId: existingUser.googleId,
              name: existingUser.name,
              isActive: existingUser.isActive,
              isDeleted: existingUser.isDeleted,
              profilePic: existingUser.profilePic || "",
              version: existingUser.version,
            };
            console.log("Event data to publish:", eventData);

            await new UserCreatedPublisher(natsWrapper.client).publish(eventData);
            console.log("UserCreated event published successfully");

            console.log("Creating JWT token...");
            const token = createToken(
              existingUser._id as unknown as string,
              existingUser.partnerId as unknown as string
            );
            console.log("JWT token created successfully");
            console.log("Token details:", {
              userId: existingUser._id,
              partnerId: existingUser.partnerId,
              tokenLength: token?.length || 0
            });

            console.log("=== Google Signin SUCCESS - New User Created ===");
            console.log("User ID:", existingUser._id);
            console.log("User Email:", existingUser.email);
            console.log("User Name:", existingUser.name);

            const responseData = {
              user: existingUser,
              googleToken: idToken,
              token: token,
              _id: user._id,
              email: user.email,
              name: user.name,
            };
            console.log("Sending success response with data:", {
              hasUser: !!responseData.user,
              hasGoogleToken: !!responseData.googleToken,
              hasToken: !!responseData.token,
              userEmail: responseData.email
            });

            res.status(200).json(responseData);
          })
          .catch((err) => {
            console.error("=== Google OAuth Token Exchange ERROR ===");
            console.error("Error type:", err?.constructor?.name);
            console.error("Error message:", err?.message);
            console.error("Error details:", err.response?.data || err.message);
            console.error("Error status:", err.response?.status);
            console.error("Error headers:", err.response?.headers);
            console.error("Request config:", {
              url: err.config?.url,
              method: err.config?.method,
              hasClientId: !!err.config?.data?.client_id,
              hasClientSecret: !!err.config?.data?.client_secret
            });
            console.error("Full error object:", err);

            res.status(500).json({
              error: "Geçersiz kimlik",
              details: err.response?.data || err.message
            });
          });
      } else {
        console.error("=== Google Signin ERROR - Email Already Exists ===");
        console.error("Email already exists in database:", user.email);
        console.error("Existing user details:", {
          id: emailExist._id,
          email: emailExist.email,
          provider: emailExist.provider,
          googleId: emailExist.googleId
        });
        console.error("This email is not associated with Google account");

        res.status(500).json({
          error: "Geçersiz kimlik doğrulama yöntemi",
          message: "Email already exists with different provider"
        });
      }
    } else {
      console.log("Existing user found, creating JWT token...");
      console.log("Existing user details:", {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        provider: existingUser.provider,
        googleId: existingUser.googleId,
        isActive: existingUser.isActive
      });

      const token = createToken(
        existingUser._id as unknown as string,
        existingUser.partnerId as unknown as string
      );
      console.log("JWT token created successfully for existing user");
      console.log("Token details:", {
        userId: existingUser._id,
        partnerId: existingUser.partnerId,
        tokenLength: token?.length || 0
      });

      console.log("=== Google Signin SUCCESS - Existing User ===");
      console.log("User ID:", existingUser._id);
      console.log("User Email:", existingUser.email);
      console.log("User Name:", existingUser.name);

      const responseData = {
        user: existingUser,
        googleToken: idToken,
        token: token,
        _id: user._id,
        email: user.email,
        name: user.name,
      };
      console.log("Sending success response for existing user:", {
        hasUser: !!responseData.user,
        hasGoogleToken: !!responseData.googleToken,
        hasToken: !!responseData.token,
        userEmail: responseData.email
      });

      res.status(200).json(responseData);
    }
  } catch (error) {
    console.error("=== Google Signin CONTROLLER ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", (error as Error)?.message);
    console.error("Error stack:", (error as Error)?.stack);
    console.error("Request details at error time:", {
      hasIdToken: !!req.body?.idToken,
      hasServerAuthCode: !!req.body?.serverAuthCode,
      userEmail: req.body?.user?.email,
      timestamp: new Date().toISOString()
    });
    console.error("Full error object:", error);

    // Determine error type and provide appropriate response
    let errorMessage = "Geçersiz veya süresi dolmuş token";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("Token expired")) {
        errorMessage = "Token süresi dolmuş";
        statusCode = 401;
      } else if (error.message.includes("Invalid token")) {
        errorMessage = "Geçersiz token";
        statusCode = 400;
      } else if (error.message.includes("Network")) {
        errorMessage = "Ağ hatası";
        statusCode = 503;
      }
    }

    console.error("Sending error response:", {
      statusCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
      error: errorMessage,
      details: (error as Error)?.message,
      timestamp: new Date().toISOString()
    });
  }
};

export default googleSigninController;
