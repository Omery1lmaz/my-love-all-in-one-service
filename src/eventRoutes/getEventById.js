"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEventByIdRouter = void 0;
const express_1 = __importDefault(require("express"));
const getUserEventsById_1 = __importDefault(require("../eventControllers/getUserEventsById"));
const router = express_1.default.Router();
exports.getUserEventByIdRouter = router;
router.get("/event/:id", 
// getEventByIdExpressValidator,
// validateRequest,
getUserEventsById_1.default);
