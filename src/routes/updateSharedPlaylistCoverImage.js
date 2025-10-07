"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSharedPlaylistCoverImageRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateSharedPlaylistCoverImage_1 = __importDefault(require("../controllers/updateSharedPlaylistCoverImage"));
const router = express_1.default.Router();
exports.updateSharedPlaylistCoverImageRouter = router;
router.put("/update/sharedAlbum/image/:id", updateSharedPlaylistCoverImage_1.default);
