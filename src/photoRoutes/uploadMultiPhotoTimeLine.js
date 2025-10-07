"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiPhotoTimeLineRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const uploadMultiPhotoTimeline_1 = __importDefault(require("../photoControllers/uploadMultiPhotoTimeline"));
const router = express_1.default.Router();
exports.uploadMultiPhotoTimeLineRouter = router;
router.post("/upload-multi-timeline", upload_1.default.array("photo", 10), uploadMultiPhotoTimeline_1.default);
