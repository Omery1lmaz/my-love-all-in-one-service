"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAllEventsRouter = void 0;
const express_1 = __importDefault(require("express"));
const event_1 = require("../Models/event");
const router = express_1.default.Router();
exports.removeAllEventsRouter = router;
router.delete("/remove-all-events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield event_1.Event.deleteMany({});
        console.log("remove-all-events");
        res.status(200).json({ message: "Events removed successfully" });
    }
    catch (error) {
        console.log("error", error);
        res.status(400).json({ message: "Events not removed" });
    }
}));
