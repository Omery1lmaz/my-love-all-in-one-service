"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSpotifyTokenRouter = void 0;
const express_1 = __importDefault(require("express"));
const refreshSpotifyToken_1 = __importDefault(require("../controllers/refreshSpotifyToken"));
const router = express_1.default.Router();
exports.refreshSpotifyTokenRouter = router;
router.get("/refresh/spotify-token", refreshSpotifyToken_1.default);
