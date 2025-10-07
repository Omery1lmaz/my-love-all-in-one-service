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
exports.googleSigninController = void 0;
const axios_1 = __importDefault(require("axios"));
const user_1 = require("../Models/user");
const createToken_1 = require("../helpers/createToken");
const verifyIdToken_1 = __importDefault(require("../helpers/verifyIdToken"));
const user_created_publisher_1 = require("../events/publishers/user-created-publisher");
const nats_wrapper_1 = require("../nats-wrapper");
const generateUniqueInvitationCode_1 = __importDefault(require("../helpers/generateUniqueInvitationCode"));
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleSigninController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    console.log("=== Google Signin Controller Started ===");
    console.log(req.body, "req.body coming");
    console.log("Request Body:", {
        idToken: req.body.idToken ? "Present" : "Missing",
        serverAuthCode: req.body.serverAuthCode ? "Present" : "Missing",
        user: req.body.user ? "Present" : "Missing",
    });
    try {
        const { idToken, serverAuthCode, user } = req.body;
        console.log("Extracted data:", {
            hasIdToken: !!idToken,
            hasServerAuthCode: !!serverAuthCode,
            userEmail: user === null || user === void 0 ? void 0 : user.email,
        });
        // Validate required fields
        if (!idToken) {
            console.error("ERROR: idToken is missing from request body");
            res.status(400).json({ error: "idToken is required" });
            return;
        }
        if (!user || !user.email) {
            console.error("ERROR: user data or email is missing from request body");
            res.status(400).json({ error: "User data and email are required" });
            return;
        }
        console.log("Verifying ID token...");
        const payload = yield (0, verifyIdToken_1.default)(idToken);
        console.log("ID token verified successfully, payload sub:", payload === null || payload === void 0 ? void 0 : payload.sub);
        console.log("Checking for existing user with googleId:", payload === null || payload === void 0 ? void 0 : payload.sub);
        let existingUser = yield user_1.User.findOne({ googleId: payload.sub });
        console.log("Database query result for googleId:", existingUser ? "User found" : "No user found");
        if (!existingUser) {
            console.log("No existing user found with googleId, checking email...");
            const emailExist = yield user_1.User.findOne({ email: user.email });
            console.log("Database query result for email:", emailExist ? "Email exists" : "Email not found");
            if (!emailExist) {
                console.log("No user found with email, creating new user...");
                // Validate serverAuthCode for new user creation
                if (!serverAuthCode) {
                    console.error("ERROR: serverAuthCode is required for new user creation");
                    res.status(400).json({
                        error: "serverAuthCode is required for new user creation",
                    });
                    return;
                }
                console.log("Making Google OAuth token exchange request...");
                console.log("OAuth request details:", {
                    hasServerAuthCode: !!serverAuthCode,
                    hasClientId: !!googleClientId,
                    hasClientSecret: !!googleClientSecret,
                });
                axios_1.default
                    .post("https://oauth2.googleapis.com/token", {
                    code: serverAuthCode,
                    client_id: googleClientId,
                    client_secret: googleClientSecret,
                    redirect_uri: "",
                    grant_type: "authorization_code",
                })
                    .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log("Google OAuth token exchange successful");
                    console.log("OAuth response status:", response.status);
                    const { refresh_token } = response.data;
                    console.log("Refresh token received:", refresh_token ? "Present" : "Missing");
                    console.log("Generating unique invitation code...");
                    const userPartnerCode = yield (0, generateUniqueInvitationCode_1.default)();
                    console.log("Generated invitation code:", userPartnerCode);
                    console.log("Creating new user object...");
                    const newUserData = {
                        googleId: payload.sub,
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
                        hasPartnerCode: !!newUserData.partnerInvitationCode,
                    });
                    existingUser = new user_1.User(newUserData);
                    console.log("Saving new user to database...");
                    yield existingUser.save();
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
                    yield new user_created_publisher_1.UserCreatedPublisher(nats_wrapper_1.natsWrapper.client).publish(eventData);
                    console.log("UserCreated event published successfully");
                    console.log("Creating JWT token...");
                    const token = (0, createToken_1.createToken)(existingUser._id, existingUser.partnerId);
                    console.log("JWT token created successfully");
                    console.log("Token details:", {
                        userId: existingUser._id,
                        partnerId: existingUser.partnerId,
                        tokenLength: (token === null || token === void 0 ? void 0 : token.length) || 0,
                    });
                    console.log("=== Google Signin SUCCESS - New User Created ===");
                    console.log("User ID:", existingUser._id);
                    console.log("User Email:", existingUser.email);
                    console.log("User Name:", existingUser.name);
                    const responseData = {
                        user: {
                            _id: existingUser._id,
                            email: existingUser.email,
                            name: existingUser.name,
                        },
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
                        userEmail: responseData.email,
                    });
                    res.status(200).json(responseData);
                }))
                    .catch((err) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    console.error("=== Google OAuth Token Exchange ERROR ===");
                    console.error("Error type:", (_a = err === null || err === void 0 ? void 0 : err.constructor) === null || _a === void 0 ? void 0 : _a.name);
                    console.error("Error message:", err === null || err === void 0 ? void 0 : err.message);
                    console.error("Error details:", ((_b = err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
                    console.error("Error status:", (_c = err.response) === null || _c === void 0 ? void 0 : _c.status);
                    console.error("Error headers:", (_d = err.response) === null || _d === void 0 ? void 0 : _d.headers);
                    console.error("Request config:", {
                        url: (_e = err.config) === null || _e === void 0 ? void 0 : _e.url,
                        method: (_f = err.config) === null || _f === void 0 ? void 0 : _f.method,
                        hasClientId: !!((_h = (_g = err.config) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.client_id),
                        hasClientSecret: !!((_k = (_j = err.config) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.client_secret),
                    });
                    console.error("Full error object:", err);
                    res.status(500).json({
                        error: "Geçersiz kimlik",
                        details: ((_l = err.response) === null || _l === void 0 ? void 0 : _l.data) || err.message,
                    });
                });
            }
            else {
                console.error("=== Google Signin ERROR - Email Already Exists ===");
                console.error("Email already exists in database:", user.email);
                console.error("Existing user details:", {
                    id: emailExist._id,
                    email: emailExist.email,
                    provider: emailExist.provider,
                    googleId: emailExist.googleId,
                });
                console.error("This email is not associated with Google account");
                res.status(500).json({
                    error: "Geçersiz kimlik doğrulama yöntemi",
                    message: "Email already exists with different provider",
                });
            }
        }
        else {
            console.log("Existing user found, creating JWT token...");
            console.log("Existing user details:", {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name,
                provider: existingUser.provider,
                googleId: existingUser.googleId,
                isActive: existingUser.isActive,
            });
            const token = (0, createToken_1.createToken)(existingUser._id, existingUser.partnerId);
            console.log("JWT token created successfully for existing user");
            console.log("Token details:", {
                userId: existingUser._id,
                partnerId: existingUser.partnerId,
                tokenLength: (token === null || token === void 0 ? void 0 : token.length) || 0,
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
                userEmail: responseData.email,
            });
            res.status(200).json(responseData);
        }
    }
    catch (error) {
        console.error("=== Google Signin CONTROLLER ERROR ===");
        console.error("Error type:", (_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name);
        console.error("Error message:", error === null || error === void 0 ? void 0 : error.message);
        console.error("Error stack:", error === null || error === void 0 ? void 0 : error.stack);
        console.error("Request details at error time:", {
            hasIdToken: !!((_b = req.body) === null || _b === void 0 ? void 0 : _b.idToken),
            hasServerAuthCode: !!((_c = req.body) === null || _c === void 0 ? void 0 : _c.serverAuthCode),
            userEmail: (_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.email,
            timestamp: new Date().toISOString(),
        });
        console.error("Full error object:", error);
        // Determine error type and provide appropriate response
        let errorMessage = "Geçersiz veya süresi dolmuş token";
        let statusCode = 500;
        if (error instanceof Error) {
            if (error.message.includes("Token expired")) {
                errorMessage = "Token süresi dolmuş";
                statusCode = 401;
            }
            else if (error.message.includes("Invalid token")) {
                errorMessage = "Geçersiz token";
                statusCode = 400;
            }
            else if (error.message.includes("Network")) {
                errorMessage = "Ağ hatası";
                statusCode = 503;
            }
        }
        console.error("Sending error response:", {
            statusCode,
            errorMessage,
            timestamp: new Date().toISOString(),
        });
        res.status(statusCode).json({
            error: errorMessage,
            details: error === null || error === void 0 ? void 0 : error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.googleSigninController = googleSigninController;
exports.default = exports.googleSigninController;
