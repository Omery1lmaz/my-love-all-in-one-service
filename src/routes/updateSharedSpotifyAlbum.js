"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSharedSpotifyAlbumRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateSharedSpotifyAlbum_1 = __importDefault(require("../controllers/updateSharedSpotifyAlbum"));
const router = express_1.default.Router();
exports.updateSharedSpotifyAlbumRouter = router;
router.post("/spotify/album", updateSharedSpotifyAlbum_1.default);
