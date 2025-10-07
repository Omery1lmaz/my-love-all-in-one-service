"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHobbiesRouter = void 0;
const express_1 = __importDefault(require("express"));
const getHobbies_1 = require("../controllers/getHobbies");
const router = express_1.default.Router();
exports.getHobbiesRouter = router;
router.get("/hobbies", getHobbies_1.getHobbiesController);
