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
exports.generateImageWithStableDiffusionRouter = void 0;
const express_1 = __importDefault(require("express"));
const aiClient_1 = require("../utils/aiClient");
const router = express_1.default.Router();
exports.generateImageWithStableDiffusionRouter = router;
router.post("/api/ai/stable-diffusion", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { prompt, n } = req.body;
            if (!prompt) {
                res.status(400).json({ status: "error", error: "Prompt gerekli." });
                return;
            }
            const result = yield (0, aiClient_1.generateImageWithStableDiffusion)({
                prompt,
                n: n ? parseInt(n) : 1,
            });
            res.status(result.status === "success" ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({ status: "error", error: (error === null || error === void 0 ? void 0 : error.message) || "Bilinmeyen hata" });
        }
    }))();
}));
