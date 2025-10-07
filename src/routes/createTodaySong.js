"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTodaySongRouter = void 0;
const express_1 = __importDefault(require("express"));
const createTodaySong_1 = require("../controllers/createTodaySong");
const router = express_1.default.Router();
exports.createTodaySongRouter = router;
router.post("/spotify/taday/song", createTodaySong_1.createTodaySongController);
