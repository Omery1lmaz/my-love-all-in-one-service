import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import { updateIfCurrentPlugin } from "mongoose-update-if-current";
interface DailySong {
  id: string; // UUID for the song entry
  name: string;
  partnerName?: string;
  images: [
    {
      url: string; // URL of the song image
      height: number; // Height of the image
      width: number; // Width of the image
    }
  ];
  external_urls: {
    spotify: string;
  };
  date: Date; // Date of the song
  spotifyTrackId: string; // Spotify track ID
  spotifyArtist: string; // Artist of the Spotify track
  spotifyAlbum: string; // Album of the Spotify track
  chosenBy?: mongoose.Schema.Types.ObjectId; // User who chose the song
  message?: string; // Optional message for the song
  addedAt: Date; // Date when the song was added
}
export interface Hobby {
  name: string;
  icon: string;
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Occasionally';
  sharedWithPartner: boolean;
}

// Add any additional interfaces or functionality related to the User model here
// For example, you could add interfaces for user preferences, notifications, settings, etc.
// You can also add custom methods or plugins to enhance the User model functionality
interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
export interface BookAttrs {
  name: string;
  author: string | undefined;
  image: string | undefined;
  description: string | undefined;
  link: string;
  year: string | undefined;
  pageCount: number | undefined;
  category: string | undefined;
  language: string;
  previewLink: string;
  infoLink: string;
  sharedWithPartner?: boolean;
}

interface Book {
  name: string;
  author: string | undefined;
  image: string | undefined;
  description: string | undefined;
  link: string;
  year: string | undefined;
  pageCount: number | undefined;
  category: string | undefined;
  language: string;
  previewLink: string;
  infoLink: string;
}

interface UserAttrs {
  name: string;
  partnerName?: string;
  email: string;
  password: string;
  birthDate?: Date;
  profilePic?: string;
  partnerId?: mongoose.Schema.Types.ObjectId | null;
  relationshipStartDate?: Date | null;
  status?: "single" | "in_relationship" | "married";
  provider: "email" | "google";
  googleId?: string;
  firstMeetingStory?: string;
  firstMeetingDate?: Date;
  mood?: "happy" | "sad" | "neutral" | "excited";
  favoriteSongs?: mongoose.Schema.Types.ObjectId[]; // this is a string of an song
  favoriteMovie?: Movie;
  subscriptionType?: "free" | "premium";
  lastLogin?: Date;
  activityLog?: string[];
  resetPasswordOtp?: string;
  resetPasswordToken?: string;
  otp?: string;
  otpExpires?: Date;
  resetPasswordOtpExpires?: Date;
  isActive: boolean;
  favoriteBook?: Book;
  version: number;
  relationshipGoals?: string[];
  isDeleted: boolean;
  partnerInvitationCode: number;
  sharedMovies: [{ isShared: boolean, movie: Movie, note?: string, createdBy: "me" | "partner" }],
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyAccessTokenExpires?: Date;
  partnerSpotifyAccessToken?: string;
  partnerSpotifyRefreshToken?: string;
  partnerSpotifyAccessTokenExpires?: Date;
  surname: string;
  gender: string;
  profilePhoto?: {
    thumbnailUrl?: string;
    url?: string;
  };
  partnerNickname?: string;
  nickname?: string;
  partnerNotes?: string;
  hobbies?: Hobby[];
  // This is a list of interests for the user
  interests?: {
    music?: string[];
    movies?: string[];
    books?: string[];
    hobbies?: string[];
  };
  dailySong?: DailySong[];
  sendedMusic?: DailySong[];
  // This is a list of favorite songs for the user
  // This is not gonna be used for now
  favorites?: {
    spotifySong?: string;
    favoritePhoto?: string;
    favoriteDate?: Date;
  };
  // This is a list of moods the user has had
  moodHistory?: {
    date: Date;
    mood:
    | "happy"
    | "sad"
    | "angry"
    | "stressed"
    | "excited"
    | "tired"
    | "peaceful"
    | "anxious";
    note?: string;
    activities?: string[];
  }[];
  // This is a list of events in the user's relationship timeline
  // This is not gonna be used for now
  relationshipTimeline?: {
    date: Date;
    event: string;
    description?: string;
    photo?: string;
  }[];
  // This is a list of reminders for the user to do
  reminders?: {
    title: string;
    date: Date;
    description?: string;
    isCompleted: boolean;
  }[];
  // This is a daily journal for the user to write about their day
  dailyJournal?: {
    date: Date;
    content: string;
    isPrivate: boolean;
  }[];
  questions?: {
    question: string;
    answer: string;
    aiSuggestion: string;
    partnerAnswer: string;
    userMessage: string;
    aiMessage: string;
    aiScore: number;
    userScore: number;
  }[];
  sharedSpotifyAlbum?: {
    createdBy: mongoose.Types.ObjectId;
    albumId?: string;
    albumLink?: string;
    name?: string;
    artists?: string[];
    images?: { url: string | null; height: number; width: number | null }[];
    releaseDate?: string;
    totalTracks?: number;
    label?: string;
    genres?: string[];
    externalUrls?: { spotify: string };
    uri?: string;
    type?: string;
    addedAt?: Date;
  }[];
  // Todo: this will be entegrated with AI
  // AI will generate questions
  // User will answer the questions
  // AI will score the questions
  // User will see the results
  // User will be able to see the quiz results
  // User will be able to see the quiz history
  // User will be able to see the quiz leaderboard
  relationshipQuizzes?: {
    date: Date;
    questions: {
      question: string;
      answer: string;
    }[];
    score?: number;
  }[];
}

interface UserDoc extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  name?: string;
  partnerName?: string;
  email: string;
  password: string;
  birthDate?: Date;
  profilePic?: string;
  firstMeetingStory?: string;
  firstMeetingDate?: Date;
  hobbies?: Hobby[];
  sharedMovies: [{ isShared: boolean, movie: Movie, note?: string, createdBy: "me" | "partner" }],
  relationshipGoals?: string[];
  provider: "email" | "google";
  googleId?: string;
  partnerId?: mongoose.Schema.Types.ObjectId | null;
  relationshipStartDate?: Date | null;
  status?: "single" | "in_relationship" | "married";
  mood?: "happy" | "sad" | "neutral" | "excited";
  favoriteSongs?: mongoose.Schema.Types.ObjectId[];
  subscriptionType: "free" | "premium";
  lastLogin?: Date;
  activityLog?: string[];
  resetPasswordOtp?: string;
  books?: BookAttrs[];
  favoriteBook?: Book;
  resetPasswordToken?: string;
  otp?: string;
  favoriteMovie?: Movie;
  otpExpires?: Date;
  resetPasswordOtpExpires?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  isActive: boolean;
  version: number;
  isDeleted: boolean;
  partnerInvitationCode: number;
  partnerSpotifyAccessToken?: string;
  partnerSpotifyRefreshToken?: string;
  partnerSpotifyAccessTokenExpires?: Date;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyAccessTokenExpires?: Date;
  surname: string;
  gender: string;
  profilePhoto?: {
    thumbnailUrl?: string;
    url?: string;
  };
  partnerNickname?: string;
  nickname?: string;
  partnerNotes?: string;
  interests?: {
    music?: string[];
    movies?: string[];
    books?: string[];
    hobbies?: string[];
  };
  sharedSpotifyAlbum?: {
    createdBy: mongoose.Types.ObjectId;
    albumId?: string;
    albumLink?: string;
    name?: string;
    artists?: string[];
    images?: { url: string | null; height: number; width: number | null }[];
    releaseDate?: string;
    totalTracks?: number;
    label?: string;
    genres?: string[];
    externalUrls?: { spotify: string };
    uri?: string;
    type?: string;
    addedAt?: Date;
  }[];
  questions?: {
    question: string;
    answer: string;
    aiSuggestion: string;
    partnerAnswer: string;
    userMessage: string;
    aiMessage: string;
    aiScore: number;
    userScore: number;
  }[];
  favorites?: {
    spotifySong?: string;
    favoritePhoto?: string;
    favoriteDate?: Date;
  };
  moodHistory?: {
    date: Date;
    mood:
    | "happy"
    | "sad"
    | "angry"
    | "stressed"
    | "excited"
    | "tired"
    | "peaceful"
    | "anxious";
    note?: string;
    activities?: string[];
  }[];
  dailySong?: DailySong[];
  sendedMusic?: DailySong[];
  relationshipTimeline?: {
    date: Date;
    event: string;
    description?: string;
    photo?: string;
  }[];
  reminders?: {
    title: string;
    date: Date;
    description?: string;
    isCompleted: boolean;
  }[];
  dailyJournal?: {
    date: Date;
    content: string;
    isPrivate: boolean;
  }[];
  relationshipQuizzes?: {
    date: Date;
    questions: {
      question: string;
      answer: string;
    }[];
    score?: number;
  }[];
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    googleId: { type: String },
    isActive: { type: Boolean, default: true, required: true },
    provider: {
      type: String,
      required: true,
      enum: ["email", "google"],
      default: "email",
    },
    resetPasswordOtp: { type: String },
    resetPasswordToken: { type: String },
    sharedSpotifyAlbum: [
      {
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: (user: any) => user._id,
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
        chosenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
        chosenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
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
    favoriteSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
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
  },
  { timestamps: true }
);

// ** Şifre Hashleme Middleware **

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ** Şifre Karşılaştırma Metodu **
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

// ** Kullanıcı Oluşturma Metodu **
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// ** Versiyonlama için Plugin Ekleme **
// userSchema.set("versionKey", "version");
// userSchema.plugin(updateIfCurrentPlugin);

// ** Kullanıcı Modelini Oluşturma **
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
