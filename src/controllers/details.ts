import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import mongoose from "mongoose";

// Types and Interfaces
interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

interface UserDetailsResponse {
  _id: string;
  email: string;
  name: string;
  nickName: string;
  partnerName: string;
  partnerNickname?: string;
  partnerCode: number;
  profilePic: string;
  partnerProfilePic: string;
  partnerId: string;
  spotifyConnected: boolean;
}

interface AuthError {
  message: string;
  statusCode: number;
}

// Constants
const AUTH_ERRORS = {
  NO_AUTH_HEADER: {
    message: "Lütfen giriş yapın",
    statusCode: 401
  },
  NO_TOKEN: {
    message: "Token bulunamadı",
    statusCode: 400
  },
  INVALID_TOKEN: {
    message: "Geçersiz token",
    statusCode: 401
  },
  USER_NOT_FOUND: {
    message: "Kullanıcı bulunamadı",
    statusCode: 404
  },
  AUTH_FAILED: {
    message: "Kimlik doğrulama başarısız",
    statusCode: 401
  }
} as const;

// Helper Functions
const extractTokenFromHeader = (authHeader: string): string | null => {
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
};

const verifyJwtToken = (token: string): JwtPayload => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY environment variable is not set");
  }
  return jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
};

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const buildUserResponse = (user: any): UserDetailsResponse => {
  const partner = user.partnerId as any;
  const sharedProfilePic = user.sharedProfilePic as any;

  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name || "",
    partnerCode: user.partnerInvitationCode,
    nickName: user.nickname || "",
    partnerName: user.partnerName || "",
    partnerNickname: user.partnerNickname,
    profilePic: sharedProfilePic ? sharedProfilePic.url || "" : "",
    partnerProfilePic: partner?.profilePhoto?.url || "",
    partnerId: partner?._id?.toString() || "",
    spotifyConnected: Boolean(user.spotifyRefreshToken)
  };
};

const sendErrorResponse = (res: Response, error: AuthError): void => {
  res.status(error.statusCode).json({ 
    success: false,
    message: error.message 
  });
};

const sendSuccessResponse = (res: Response, data: UserDetailsResponse): void => {
  res.status(200).json({
    success: true,
    data
  });
};

// Main Controller
export const detailsController = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendErrorResponse(res, AUTH_ERRORS.NO_AUTH_HEADER);
      return;
    }

    // 2. Extract and Validate Token
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      sendErrorResponse(res, AUTH_ERRORS.NO_TOKEN);
      return;
    }

    // 3. Verify JWT Token
    let decodedToken: JwtPayload;
    try {
      decodedToken = verifyJwtToken(token);
    } catch (jwtError) {
      sendErrorResponse(res, AUTH_ERRORS.INVALID_TOKEN);
      return;
    }

    // 4. Validate User ID
    if (!isValidObjectId(decodedToken.id)) {
      sendErrorResponse(res, AUTH_ERRORS.USER_NOT_FOUND);
      return;
    }

    // 5. Fetch User from Database
    const user = await User.findById(decodedToken.id)
      .populate("partnerId")
      .populate("sharedProfilePic")
      .lean();

    if (!user) {
      sendErrorResponse(res, AUTH_ERRORS.USER_NOT_FOUND);
      return;
    }

    // 6. Build and Send Response
    const userResponse = buildUserResponse(user);
    sendSuccessResponse(res, userResponse);

  } catch (error) {
    console.error("Details controller error:", error);
    sendErrorResponse(res, AUTH_ERRORS.AUTH_FAILED);
  }
};

export default detailsController;
