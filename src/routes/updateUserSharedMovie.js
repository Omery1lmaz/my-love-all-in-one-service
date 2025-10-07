"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSharedMovieRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const updateUserSharedMovie_1 = __importDefault(require("../controllers/updateUserSharedMovie"));
const router = express_1.default.Router();
exports.updateUserSharedMovieRouter = router;
router.post("/update-user-shared-movie", my_love_common_1.validateRequest, updateUserSharedMovie_1.default);
