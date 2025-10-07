"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhotoByIdRouter = void 0;
const express_1 = __importDefault(require("express"));
const getPhotoById_1 = __importDefault(require("../photoControllers/getPhotoById"));
const router = express_1.default.Router();
exports.getPhotoByIdRouter = router;
router.get("/photos/:photoId", getPhotoById_1.default);
