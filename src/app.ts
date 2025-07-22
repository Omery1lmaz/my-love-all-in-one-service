import express from "express";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@heaven-nsoft/common";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { verifyRegisterRouter } from "./routes/verifyRegister";
import { googleSigninRouter } from "./routes/googleSignin";
import { registerResendOTPRouter } from "./routes/registerResendOTP";
import { forgetPasswordResendOTPRouter } from "./routes/forgetPasswordResendOTP";
import { resetPasswordVerifyOTPRouter } from "./routes/resetPasswordVerifyOTP";
import { profileRouter } from "./routes/profile";
import { deleteProfileRouter } from "./routes/deleteProfile";
import { checkRegisterEmailRouter } from "./routes/checkRegisterEmail";
import { resetPasswordRouter } from "./routes/resetPassword";
import { resetPasswordSendEmailRouter } from "./routes/resetPasswordSendEmail";
import { updatePasswordRouter } from "./routes/updatePassword";
import { detailRouter } from "./routes/details";
import { updateUserNameRouter } from "./routes/updateUserName";
import { verifyRegisterPartnerCodeRouter } from "./routes/verifyRegisterPartnerCode";
import { updateSpotifyTokensRouter } from "./routes/updateSpotifyTokens";
import { moodRouter } from "./routes/mood";
import { partnerRouter } from "./routes/partner";
import { quizRouter } from "./routes/quiz";
import { reminderRouter } from "./routes/reminder";
import { statsRouter } from "./routes/stats";
import { updateUserProfileDetailsRouter } from "./routes/updateUserProfileDetails";
import { updateUserQuestionsRouter } from "./routes/updateUserQuestions";
import { updateUserFavoriteMovieRouter } from "./routes/updateUserFavoriteMovie";
import { updateUserFavoriteBookRouter } from "./routes/updateUserFavoriteBook";
import { updateUserHobbiesRouter } from "./routes/updateUserHobbies";
import { getUserHobbiesRouter } from "./routes/getUserHobbies";
import { updateUserRelationshipDateRouter } from "./routes/updateUserRelationshipDate";
import { getUserRelationshipDateRouter } from "./routes/getUserRelationshipDate";
import { updateMoodRouter } from "./routes/updateMood";
import { getTodayMoodRouter } from "./routes/getTodayMood";
import { refreshSpotifyTokenRouter } from "./routes/refreshSpotifyToken";
import { refreshPartnerSpotifyTokenRouter } from "./routes/refreshPartnerSpotifyToken";
import { updateSharedSpotifyAlbumRouter } from "./routes/updateSharedSpotifyAlbum";
import { getSharedSpotifyAlbumRouter } from "./routes/getSharedSpotifyAlbum";
import { createTodaySongRouter } from "./routes/createTodaySong";
import { getTodaySongRouter } from "./routes/getTodaySong";
import { updateSharedPlaylistCoverImageRouter } from "./routes/updateSharedPlaylistCoverImage";
import { updateSharedSpotifyAlbumDetailRouter } from "./routes/updateSharedSpotifyAlbumDetail";
import { getSharedSpotifyAlbumDetailRouter } from "./routes/getSharedSpotifyAlbumDetail";
import { sendSongRouter } from "./routes/sendSong";
import { getSendSongRouter } from "./routes/getSendSong";
import { createHobbyRouter } from "./routes/createHobby";
import { getHobbiesRouter } from "./routes/getHobbies";
import { updateHobbyRouter } from "./routes/updateHobby";
import { getHobbyDetailsRouter } from "./routes/getHobbyDetails";
import { deleteHobbyRouter } from "./routes/deleteHobby";
import { createBookRouter } from "./routes/createBook";
import { deleteBookRouter } from "./routes/deleteBook";
import { getBooksRouter } from "./routes/getBooks";
import { updateUserSharedMovieRouter } from "./routes/updateUserSharedMovie";
import { getUserSharedMovieRouter } from "./routes/getUserSharedMovie";
import { getUserSharedMovieDetailRouter } from "./routes/getUserSharedMovieDetail";
import { deleteUserSharedMovieRouter } from "./routes/deleteUserSharedMovie";
import { getUserQuestionsRouter } from "./routes/getUserQuestions";
import { updateUserQuestionRouter } from "./routes/updateUserQuestion";
import { getPartnerQuestionsRouter } from "./routes/getPartnerQuestions";
import { answerPartnerQuestionRouter } from "./routes/answerPartnerQuestion";
import { getNotScoredQuestionsRouter } from "./routes/getNotScoredQuestions";
import { UpdateQuestionScoreRouter } from "./routes/UpdateQuestionScore";
import { generateImageVariationRouter } from "./routes/generateImageVariation";
import { generateImageWithGeminiRouter } from "./routes/generateImageWithGemini";
import { generateImageWithStableDiffusionRouter } from "./routes/generateImageWithStableDiffusion";
import { getPartnerTodayMoodRouter } from "./routes/getPartnerTodayMood";
import { albumRouter } from "./albumRoutes/album";
import { userAlbumRouter } from "./albumRoutes/userAlbums";
import { getAlbumByIdRouter } from "./albumRoutes/getAlbumById";
import { createJournalRouter } from "./dailyJourneyRoutes/createJournal";
import { getUserJournalsRouter } from "./dailyJourneyRoutes/getUserJournals";
import { getPartnerJournalsRouter } from "./dailyJourneyRoutes/getPartnerJournals";
import { getJournalDetailRouter } from "./dailyJourneyRoutes/getJournalDetail";
import { createEventRouter } from "./eventRoutes/createEvent";
import { getUserEventsRouter } from "./eventRoutes/getUserEvents";
import { getUserEventByIdRouter } from "./eventRoutes/getEventById";
import { getUpcomingEventsRouter } from "./eventRoutes/getUpcomingEvents";
import { uploadPhotoRouter } from "./photoRoutes/uploadPhoto";
import { uploadMultiPhotoEventRouter } from "./photoRoutes/uploadMultiPhotoEvent";
import { uploadMultiPhotoRouter } from "./photoRoutes/uploadMultiPhoto";
import { uploadMultiPhotoTimeLineRouter } from "./photoRoutes/uploadMultiPhotoTimeLine";
import { getUserPhotosRouter } from "./photoRoutes/getUserPhotos";
import { getPhotoByIdRouter } from "./photoRoutes/getPhotoById";
import { updateUserPhotoMomentRouter } from "./photoRoutes/updateUserPhotoMoment";
import { uploadUserProfilePhotoRouter } from "./photoRoutes/uploadUserProfilePhoto";
import { uploadMultiPhotoDailyJourneyRouter } from "./photoRoutes/uploadMultiPhotoDailyJourney";
import { createTimelineRouter } from "./timelineRoutes/createTimeline";
import { getTimelineByUserRouter } from "./timelineRoutes/getTimelineByUser";
import { getTimelineByIdRouter } from "./timelineRoutes/getTimelineById";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.all("", async (req, res, next) => {
  console.log("test", req.url);
  next();
});
// Spotify

app.use(getSharedSpotifyAlbumRouter);
app.use(getSharedSpotifyAlbumDetailRouter);
app.use(updateSharedSpotifyAlbumRouter);
app.use(refreshPartnerSpotifyTokenRouter);
app.use(updateSharedPlaylistCoverImageRouter);
app.use(updateSpotifyTokensRouter);
app.use(refreshSpotifyTokenRouter);
app.use(createTodaySongRouter);
app.use(updateSharedSpotifyAlbumDetailRouter);
app.use(getTodaySongRouter);
app.use(sendSongRouter);
app.use(getSendSongRouter);

// Login or Signup

app.use(signinRouter);
app.use(signupRouter);
app.use(verifyRegisterRouter);
app.use(googleSigninRouter);
app.use(checkRegisterEmailRouter);
app.use(verifyRegisterPartnerCodeRouter);

// Password Management
app.use(forgetPasswordResendOTPRouter);
app.use(resetPasswordVerifyOTPRouter);
app.use(resetPasswordRouter);
app.use(resetPasswordSendEmailRouter);
app.use(updateUserQuestionRouter);
app.use(UpdateQuestionScoreRouter);

// User Profile Management
app.use(profileRouter);
app.use(deleteProfileRouter);
app.use(detailRouter);
app.use(updateUserNameRouter);
app.use(statsRouter);
app.use(updateUserProfileDetailsRouter);

// Partner's Profile Management
app.use(partnerRouter);

// User's favorites
// User's Questions
app.use(updateUserQuestionsRouter);
app.use(getUserQuestionsRouter);
app.use(getPartnerQuestionsRouter);
app.use(quizRouter);
app.use(answerPartnerQuestionRouter);
app.use(getNotScoredQuestionsRouter);
// User's Mood
app.use(getPartnerTodayMoodRouter);
app.use(moodRouter);
app.use(updateMoodRouter);
app.use(getTodayMoodRouter);

// User's Reminders
app.use(reminderRouter);

// User's Favorite Books
app.use(createBookRouter);
app.use(deleteBookRouter);
app.use(getBooksRouter);
app.use(updateUserFavoriteBookRouter);

// User's Favorite Movies
app.use(updateUserFavoriteMovieRouter);
app.use(updateUserSharedMovieRouter);
app.use(getUserSharedMovieRouter);
app.use(getUserSharedMovieDetailRouter);
app.use(deleteUserSharedMovieRouter);

// User's Hobbies
app.use(createHobbyRouter);
app.use(updateHobbyRouter);
app.use(getHobbyDetailsRouter);
app.use(deleteHobbyRouter);
app.use(getHobbiesRouter);
app.use(updateUserHobbiesRouter);
app.use(getUserHobbiesRouter);

// User Relationship Stats
app.use(updateUserRelationshipDateRouter);
app.use(getUserRelationshipDateRouter);

app.use(generateImageVariationRouter);
app.use(generateImageWithGeminiRouter);
app.use(generateImageWithStableDiffusionRouter);

app.all("*", async (req, res, next) => {
  next(new NotFoundError());
});

// Album Service Start

app.use('/albums', albumRouter);
app.use('/albums', userAlbumRouter);
app.use('/albums', getAlbumByIdRouter);


// ALbum Service End


// Daily Journey Service Start

app.use('/daily-journey', createJournalRouter);
app.use('/daily-journey', getUserJournalsRouter);
app.use('/daily-journey', getPartnerJournalsRouter);
app.use('/daily-journey', getJournalDetailRouter);

// Daily Journey Service End


// Event Service Start

app.use('/event', createEventRouter);
app.use('/event', getUserEventsRouter);
app.use('/event', getUserEventByIdRouter);
app.use('/event', getUpcomingEventsRouter);


// Event Service End


// Photo Service Start


app.use('/photo', uploadPhotoRouter);
app.use('/photo', uploadMultiPhotoEventRouter);
app.use('/photo', uploadMultiPhotoRouter);
app.use('/photo', uploadMultiPhotoTimeLineRouter);
app.use('/photo', getUserPhotosRouter);
app.use('/photo', getPhotoByIdRouter);
app.use('/photo', updateUserPhotoMomentRouter);
app.use('/photo', uploadUserProfilePhotoRouter);
app.use('/photo', uploadMultiPhotoDailyJourneyRouter);


// Photo Service End

// Timeline Service Start


app.use('/timeline', createTimelineRouter);
app.use('/timeline', getTimelineByUserRouter);
app.use('/timeline', getTimelineByIdRouter);

// Timeline Service End

// Page entegrated with api 

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    errorHandler(err, req, res, next);
  }
);

export { app };
