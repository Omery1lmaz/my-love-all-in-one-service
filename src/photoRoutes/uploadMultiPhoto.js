"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiPhotoRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const uploadMultiPhoto_1 = __importDefault(require("../photoControllers/uploadMultiPhoto"));
const router = express_1.default.Router();
exports.uploadMultiPhotoRouter = router;
router.post("/upload-multi", upload_1.default.array("photo", 10), uploadMultiPhoto_1.default);
