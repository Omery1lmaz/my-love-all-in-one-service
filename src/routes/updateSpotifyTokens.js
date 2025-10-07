"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSpotifyTokensRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@heaven-nsoft/common");
const updateSpotifyTokens_1 = __importDefault(require("../controllers/updateSpotifyTokens"));
const updateSpotifyTokens_2 = __importDefault(require("../expressValidators/updateSpotifyTokens"));
const router = express_1.default.Router();
exports.updateSpotifyTokensRouter = router;
router.post("/update-spotify-tokens", updateSpotifyTokens_2.default, common_1.validateRequest, updateSpotifyTokens_1.default);
