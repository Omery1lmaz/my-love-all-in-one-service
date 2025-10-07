"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshPartnerSpotifyTokenRouter = void 0;
const express_1 = __importDefault(require("express"));
const refreshPartnerSpotifyToken_1 = __importDefault(require("../controllers/refreshPartnerSpotifyToken"));
const router = express_1.default.Router();
exports.refreshPartnerSpotifyTokenRouter = router;
router.get("/refresh/partner/spotify-token", refreshPartnerSpotifyToken_1.default);
