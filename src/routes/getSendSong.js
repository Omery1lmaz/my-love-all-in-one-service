"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSendSongRouter = void 0;
const express_1 = __importDefault(require("express"));
const getSendSong_1 = require("../controllers/getSendSong");
const router = express_1.default.Router();
exports.getSendSongRouter = router;
router.get("/spotify/song", getSendSong_1.getSendSongController);
