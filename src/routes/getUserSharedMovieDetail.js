"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSharedMovieDetailRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const getUserSharedMovieDetail_1 = __importDefault(require("../controllers/getUserSharedMovieDetail"));
const router = express_1.default.Router();
exports.getUserSharedMovieDetailRouter = router;
router.get("/get-user-shared-movie/detail/:id", my_love_common_1.validateRequest, getUserSharedMovieDetail_1.default);
