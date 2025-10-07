"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserProfilePhotoRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/multer-s3/upload"));
const uploadUserPhoto_1 = __importDefault(require("../photoControllers/uploadUserPhoto"));
const router = express_1.default.Router();
exports.uploadUserProfilePhotoRouter = router;
router.post("/upload/user/profile", upload_1.default.single("photo"), uploadUserPhoto_1.default);
