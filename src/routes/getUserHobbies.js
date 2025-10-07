"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserHobbiesRouter = void 0;
const express_1 = __importDefault(require("express"));
const getUserHobbies_1 = __importDefault(require("../controllers/getUserHobbies"));
const router = express_1.default.Router();
exports.getUserHobbiesRouter = router;
router.get("/hobbies", getUserHobbies_1.default);
