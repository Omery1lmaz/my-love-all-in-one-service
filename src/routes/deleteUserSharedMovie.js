"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSharedMovieRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const deleteUserSharedMovie_1 = __importDefault(require("../controllers/deleteUserSharedMovie"));
const router = express_1.default.Router();
exports.deleteUserSharedMovieRouter = router;
router.delete("/delete-user-shared-movie/:id", my_love_common_1.validateRequest, deleteUserSharedMovie_1.default);
