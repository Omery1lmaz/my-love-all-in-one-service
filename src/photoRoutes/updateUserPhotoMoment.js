"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPhotoMomentRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateUserPhotoMoment_1 = __importDefault(require("../photoControllers/updateUserPhotoMoment"));
const router = express_1.default.Router();
exports.updateUserPhotoMomentRouter = router;
router.put("/photos/moment/:photoId", updateUserPhotoMoment_1.default);
