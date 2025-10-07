"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHobbyRouter = void 0;
const express_1 = __importDefault(require("express"));
const createHobby_1 = require("../controllers/createHobby");
const router = express_1.default.Router();
exports.createHobbyRouter = router;
router.post("/hobbies", createHobby_1.createHobbyController);
