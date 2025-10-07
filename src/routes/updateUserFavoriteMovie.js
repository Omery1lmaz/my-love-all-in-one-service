"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserFavoriteMovieRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateUserFavoriteMovie_1 = __importDefault(require("../controllers/updateUserFavoriteMovie"));
const updateUserFavoriteMovie_2 = __importDefault(require("../expressValidators/updateUserFavoriteMovie"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const router = express_1.default.Router();
exports.updateUserFavoriteMovieRouter = router;
router.post("/update-user-favorite-movie", updateUserFavoriteMovie_2.default, my_love_common_1.validateRequest, updateUserFavoriteMovie_1.default);
