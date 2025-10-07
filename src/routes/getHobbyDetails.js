"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHobbyDetailsRouter = void 0;
const express_1 = __importDefault(require("express"));
const getHobbyDetails_1 = require("../controllers/getHobbyDetails");
const router = express_1.default.Router();
exports.getHobbyDetailsRouter = router;
router.get("/hobbies/:id", getHobbyDetails_1.getHobbyDetailsController);
