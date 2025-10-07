"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiPhotoEventRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const uploadMultiPhotoEvent_1 = __importDefault(require("../photoControllers/uploadMultiPhotoEvent"));
const router = express_1.default.Router();
exports.uploadMultiPhotoEventRouter = router;
router.post("/upload-multi-event", upload_1.default.array("photo", 10), uploadMultiPhotoEvent_1.default);
