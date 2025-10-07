"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedSpotifyAlbumRouter = void 0;
const express_1 = __importDefault(require("express"));
const getSharedSpotifyAlbum_1 = __importDefault(require("../controllers/getSharedSpotifyAlbum"));
const router = express_1.default.Router();
exports.getSharedSpotifyAlbumRouter = router;
router.get("/spotify/album", getSharedSpotifyAlbum_1.default);
