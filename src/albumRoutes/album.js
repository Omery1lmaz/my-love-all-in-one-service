"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.albumRouter = void 0;
const express_1 = __importDefault(require("express"));
const album_1 = require("../albumsControllers/album");
const router = express_1.default.Router();
exports.albumRouter = router;
// Create album with optional cover photo
router.post("/albums", album_1.createAlbum);
