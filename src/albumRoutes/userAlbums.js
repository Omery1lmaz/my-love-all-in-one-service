"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAlbumRouter = void 0;
const express_1 = __importDefault(require("express"));
const userAlbums_1 = require("../albumsControllers/userAlbums");
const router = express_1.default.Router();
exports.userAlbumRouter = router;
router.get("/user-albums", userAlbums_1.userAlbums);
