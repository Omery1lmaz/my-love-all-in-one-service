import { body } from "express-validator";

export const addPointsValidator = [
  body("action")
    .notEmpty()
    .withMessage("Action gerekli")
    .isIn([
      "daily_note",
      "photo_upload", 
      "playlist_create",
      "event_create",
      "comment_on_partner_note",
      "seven_day_streak",
      "challenge_complete",
      "first_photo_together",
      "anniversary_reminder",
      "mood_share",
      "achievement_unlock"
    ])
    .withMessage("Geçersiz action türü"),
    
  body("points")
    .isInt({ min: 1, max: 1000 })
    .withMessage("Points 1-1000 arasında olmalı"),
    
  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata obje olmalı")
];

