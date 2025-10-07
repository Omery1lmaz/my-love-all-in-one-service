"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumByIdRouter = void 0;
const express_1 = __importDefault(require("express"));
const getAlbumById_1 = __importDefault(require("../albumsControllers/getAlbumById"));
const router = express_1.default.Router();
exports.getAlbumByIdRouter = router;
router.get("/get-album-by-id/:id", getAlbumById_1.default);
