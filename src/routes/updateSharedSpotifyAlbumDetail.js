"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSharedSpotifyAlbumDetailRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateSharedSpotifyAlbumDetail_1 = __importDefault(require("../controllers/updateSharedSpotifyAlbumDetail"));
const router = express_1.default.Router();
exports.updateSharedSpotifyAlbumDetailRouter = router;
router.put("/spotify/album/detail/:id", updateSharedSpotifyAlbumDetail_1.default);
