"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserFavoriteBookRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const updateUserFavoriteBook_1 = __importDefault(require("../controllers/updateUserFavoriteBook"));
const updateUserFavoriteBook_2 = __importDefault(require("../expressValidators/updateUserFavoriteBook"));
const router = express_1.default.Router();
exports.updateUserFavoriteBookRouter = router;
router.post("/update-user-favorite-book", updateUserFavoriteBook_2.default, my_love_common_1.validateRequest, updateUserFavoriteBook_1.default);
