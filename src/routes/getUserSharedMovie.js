"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSharedMovieRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const getUserSharedMovie_1 = __importDefault(require("../controllers/getUserSharedMovie"));
const router = express_1.default.Router();
exports.getUserSharedMovieRouter = router;
router.get("/get-user-shared-movie", my_love_common_1.validateRequest, getUserSharedMovie_1.default);
