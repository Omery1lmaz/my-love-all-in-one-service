"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHobbyRouter = void 0;
const express_1 = __importDefault(require("express"));
const deleteHobby_1 = require("../controllers/deleteHobby");
const router = express_1.default.Router();
exports.deleteHobbyRouter = router;
router.delete("/hobbies/:id", deleteHobby_1.deleteHobbyController);
