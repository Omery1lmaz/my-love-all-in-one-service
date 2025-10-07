"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSongRouter = void 0;
const express_1 = __importDefault(require("express"));
const sendSong_1 = require("../controllers/sendSong");
const router = express_1.default.Router();
exports.sendSongRouter = router;
router.post("/spotify/song", sendSong_1.sendSongController);
