"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserSharedProfilePhotoRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const uploadUserSharedProfilePhoto_1 = __importDefault(require("../photoControllers/uploadUserSharedProfilePhoto"));
const router = express_1.default.Router();
exports.uploadUserSharedProfilePhotoRouter = router;
router.post("/upload/user/shared/profile", upload_1.default.single("photo"), uploadUserSharedProfilePhoto_1.default);
