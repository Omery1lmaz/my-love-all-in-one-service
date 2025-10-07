"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhotoRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const uploadPhoto_1 = __importDefault(require("../photoControllers/uploadPhoto"));
const router = express_1.default.Router();
exports.uploadPhotoRouter = router;
router.post("/upload", upload_1.default.single("photo"), uploadPhoto_1.default);
