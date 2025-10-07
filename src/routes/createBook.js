"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookRouter = void 0;
const express_1 = __importDefault(require("express"));
const createBook_1 = require("../controllers/createBook");
const router = express_1.default.Router();
exports.createBookRouter = router;
router.post("/books", createBook_1.createBookController);
