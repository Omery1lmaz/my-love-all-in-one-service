"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooksRouter = void 0;
const express_1 = __importDefault(require("express"));
const getBooks_1 = require("../controllers/getBooks");
const router = express_1.default.Router();
exports.getBooksRouter = router;
router.get("/books", getBooks_1.getBooksController);
