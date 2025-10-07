"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detailsController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../Models/user");
const mongoose_1 = __importDefault(require("mongoose"));
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
};
// Helper Functions
const extractTokenFromHeader = (authHeader) => {
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    return parts[1];
};
const verifyJwtToken = (token) => {
    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY environment variable is not set");
    }
    return jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
};
const isValidObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
const buildUserResponse = (user) => {
    var _a, _b;
    const partner = user.partnerId;
    const sharedProfilePic = user.sharedProfilePic;
    return {
        _id: user._id.toString(),
        email: user.email,
        name: user.name || "",
        partnerCode: user.partnerInvitationCode,
        nickName: user.nickname || "",
        partnerName: user.partnerName || "",
        partnerNickname: user.partnerNickname,
        profilePic: sharedProfilePic ? sharedProfilePic.url || "" : "",
        partnerProfilePic: ((_a = partner === null || partner === void 0 ? void 0 : partner.profilePhoto) === null || _a === void 0 ? void 0 : _a.url) || "",
        partnerId: ((_b = partner === null || partner === void 0 ? void 0 : partner._id) === null || _b === void 0 ? void 0 : _b.toString()) || "",
        spotifyConnected: Boolean(user.spotifyRefreshToken)
    };
};
const sendErrorResponse = (res, error) => {
    res.status(error.statusCode).json({
        success: false,
        message: error.message
    });
};
const sendSuccessResponse = (res, data) => {
    res.status(200).json({
        success: true,
        data
    });
};
// Main Controller
const detailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let decodedToken;
        try {
            decodedToken = verifyJwtToken(token);
        }
        catch (jwtError) {
            sendErrorResponse(res, AUTH_ERRORS.INVALID_TOKEN);
            return;
        }
        // 4. Validate User ID
        if (!isValidObjectId(decodedToken.id)) {
            sendErrorResponse(res, AUTH_ERRORS.USER_NOT_FOUND);
            return;
        }
        // 5. Fetch User from Database
        const user = yield user_1.User.findById(decodedToken.id)
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
    }
    catch (error) {
        console.error("Details controller error:", error);
        sendErrorResponse(res, AUTH_ERRORS.AUTH_FAILED);
    }
});
exports.detailsController = detailsController;
exports.default = exports.detailsController;
