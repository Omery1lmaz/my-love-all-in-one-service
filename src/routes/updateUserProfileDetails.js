"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfileDetailsRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateUserProfileDetails_1 = __importDefault(require("../controllers/updateUserProfileDetails"));
const upload_1 = __importDefault(require("../utils/multer-s3/upload"));
const router = express_1.default.Router();
exports.updateUserProfileDetailsRouter = router;
router.post("/update-user-profile-details", upload_1.default.single("profilePhoto"), updateUserProfileDetails_1.default);
