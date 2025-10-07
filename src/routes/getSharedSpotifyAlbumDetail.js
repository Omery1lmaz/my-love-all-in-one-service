"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedSpotifyAlbumDetailRouter = void 0;
const express_1 = __importDefault(require("express"));
const getSharedSpotifyAlbumDetail_1 = __importDefault(require("../controllers/getSharedSpotifyAlbumDetail"));
const router = express_1.default.Router();
exports.getSharedSpotifyAlbumDetailRouter = router;
router.get("/spotify/album/detail/:id", getSharedSpotifyAlbumDetail_1.default);
