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
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
    googleId: { type: String },
    isActive: { type: Boolean, default: false, required: true },
    provider: {
        type: String,
        required: true,
        enum: ["email", "google"],
        default: "email",
    },
    resetPasswordOtp: { type: String },
    sharedProfilePic: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "UserPhoto", default: null },
    resetPasswordToken: { type: String },
    sharedSpotifyAlbum: [
        {
            createdBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                default: (user) => user._id,
            },
            albumId: { type: String, required: false },
            albumLink: { type: String, required: false },
            name: { type: String, required: false },
            partnerName: { type: String, required: false },
            artists: [{ type: String, required: false }],
            images: [
                {
                    url: { type: String, required: false },
                    height: { type: Number, required: false },
                    width: { type: Number, required: false },
                },
            ],
            releaseDate: { type: String, required: false },
            totalTracks: { type: Number, required: false },
            label: { type: String },
            genres: [{ type: String }],
            externalUrls: {
                spotify: { type: String, required: false },
            },
            uri: { type: String, required: false },
            type: { type: String, required: false },
            addedAt: { type: Date, default: Date.now },
        },
    ],
    spotifyAccessToken: { type: String, required: false },
    spotifyRefreshToken: { type: String, required: false },
    spotifyAccessTokenExpires: { type: Date, required: false },
    partnerSpotifyAccessToken: { type: String, required: false },
    partnerSpotifyRefreshToken: { type: String, required: false },
    partnerSpotifyAccessTokenExpires: { type: Date, required: false },
    dailySong: [
        {
            images: [
                {
                    url: { type: String, required: false },
                    height: { type: Number, required: false },
                    width: { type: Number, required: false },
                },
            ],
            external_urls: [
                {
                    spotify: { type: String, required: false },
                },
            ],
            spotifyArtist: { type: String, required: false },
            spotifyAlbum: { type: String, required: false },
            name: { type: String, required: false },
            addedAt: { type: Date, required: true, default: Date.now },
            date: { type: Date, required: true, default: Date.now },
            spotifyTrackId: { type: String, required: true },
            chosenBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
            message: { type: String },
        },
    ],
    sendedMusic: [
        {
            images: [
                {
                    url: { type: String, required: false },
                    height: { type: Number, required: false },
                    width: { type: Number, required: false },
                },
            ],
            external_urls: [
                {
                    spotify: { type: String, required: false },
                },
            ],
            spotifyArtist: { type: String, required: false },
            spotifyAlbum: { type: String, required: false },
            name: { type: String, required: false },
            addedAt: { type: Date, required: true, default: Date.now },
            date: { type: Date, required: true, default: Date.now },
            spotifyTrackId: { type: String, required: true },
            chosenBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
            message: { type: String },
        },
    ],
    otp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    otpExpires: { type: Date },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function () {
            return this.provider === "email";
        },
        select: false,
    },
    birthDate: { type: Date, required: false },
    profilePic: { type: String, default: "" },
    newPassword: { type: String, required: false },
    partnerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    hobbies: [{
            name: { type: String, required: true },
            icon: {
                type: String,
                required: true,
                // No enum, allowing any MaterialCommunityIcons icon name
            },
            description: { type: String, required: true },
            frequency: {
                type: String,
                required: true,
                enum: ['Daily', 'Weekly', 'Monthly', 'Occasionally']
            },
            sharedWithPartner: { type: Boolean, default: true },
            isCustom: { type: Boolean, default: false }
        }],
    books: [{
            link: { type: String, required: true },
            name: { type: String, required: true },
            image: { type: String, required: false },
            previewLink: { type: String, required: false },
            infoLink: { type: String, required: false },
            sharedWithPartner: { type: Boolean, required: true, default: false },
            category: { type: String, required: false },
            description: { type: String, required: false },
            pageCount: { type: Number, required: false },
            language: { type: String, required: false },
            year: { type: String, required: false },
            author: {
                type: String,
                required: false,
            },
        }],
    relationshipStartDate: { type: Date, default: null },
    status: {
        type: String,
        enum: ["single", "in_relationship", "married"],
        default: "single",
    },
    mood: {
        type: String,
        enum: ["happy", "sad", "neutral", "excited"],
        default: "neutral",
    },
    favoriteSongs: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Song" }],
    subscriptionType: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
    },
    lastLogin: { type: Date, default: Date.now },
    activityLog: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    partnerInvitationCode: { type: Number, required: true, unique: true },
    surname: { type: String, required: false },
    gender: { type: String, required: false },
    profilePhoto: {
        thumbnailUrl: { type: String, required: false },
        url: { type: String, required: false },
    },
    partnerNickname: { type: String },
    nickname: { type: String },
    partnerNotes: { type: String },
    interests: {
        music: [String],
        movies: [String],
        books: [String],
        hobbies: [String],
    },
    favorites: {
        spotifySong: String,
        favoritePhoto: String,
        favoriteDate: Date,
    },
    moodHistory: [
        {
            date: Date,
            mood: {
                type: String,
                enum: [
                    "happy",
                    "sad",
                    "angry",
                    "stressed",
                    "excited",
                    "tired",
                    "peaceful",
                    "anxious",
                ],
                required: true,
            },
            note: String,
            activities: [String],
        },
    ],
    relationshipTimeline: [
        {
            date: Date,
            event: String,
            description: String,
            photo: String,
        },
    ],
    reminders: [
        {
            title: String,
            date: Date,
            description: String,
            isCompleted: Boolean,
        },
    ],
    dailyJournal: [
        {
            date: Date,
            content: String,
            isPrivate: Boolean,
        },
    ],
    sharedMovies: [
        {
            createdBy: {
                type: String,
                enum: ["me", "partner"],
                required: true,
            },
            isShared: Boolean,
            note: String,
            movie: {
                adult: Boolean,
                backdrop_path: String,
                genre_ids: [Number],
                id: Number,
                original_language: String,
                original_title: String,
                overview: String,
                popularity: Number,
                poster_path: String,
                release_date: String,
                title: String,
                video: Boolean,
                vote_average: Number,
                vote_count: Number,
            },
        }
    ],
    relationshipQuizzes: [
        {
            date: Date,
            questions: [
                {
                    question: String,
                    answer: String,
                },
            ],
            score: Number,
        },
    ],
    questions: [
        {
            question: { type: String },
            answer: { type: String },
            userMessage: { type: String },
            aiSuggestion: { type: String },
            aiMessage: { type: String },
            partnerAnswer: { type: String },
            aiScore: { type: Number, default: 0, required: true },
            userScore: { type: Number, default: 0, required: true },
        },
    ],
    expoPushToken: { type: String, required: false },
    favoriteMovie: {
        adult: Boolean,
        backdrop_path: String,
        genre_ids: [Number],
        id: Number,
        original_language: String,
        original_title: String,
        overview: String,
        popularity: Number,
        poster_path: String,
        release_date: String,
        title: String,
        video: Boolean,
        vote_average: Number,
        vote_count: Number,
    },
    favoriteBook: {
        name: String,
        author: String,
        image: String,
        description: String,
        link: String,
        year: String,
        pageCount: Number,
        category: String,
        language: String,
        previewLink: String,
        infoLink: String,
    },
}, { timestamps: true });
// ** Şifre Hashleme Middleware **
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
        next();
    });
});
// ** Şifre Karşılaştırma Metodu **
userSchema.methods.matchPassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(enteredPassword, this.password);
    });
};
// ** Kullanıcı Oluşturma Metodu **
userSchema.statics.build = (attrs) => {
    return new User(attrs);
};
// ** Versiyonlama için Plugin Ekleme **
// userSchema.set("versionKey", "version");
// userSchema.plugin(updateIfCurrentPlugin);
// ** Kullanıcı Modelini Oluşturma **
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
