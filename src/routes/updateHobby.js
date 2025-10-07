"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHobbyRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateHoobby_1 = require("../controllers/updateHoobby");
const router = express_1.default.Router();
exports.updateHobbyRouter = router;
router.put("/hobbies/:id", updateHoobby_1.updateHobbyController);
