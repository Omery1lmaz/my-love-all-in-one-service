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
exports.generateImageVariationRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const aiClient_1 = require("../utils/aiClient");
const router = express_1.default.Router();
exports.generateImageVariationRouter = router;
const upload = (0, multer_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB'a çıkaralım, sonra küçülteceğiz
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
            return cb(new Error("Sadece PNG veya JPEG dosyası yükleyin."));
        }
        cb(null, true);
    },
});
router.post("/api/ai/image-variation", upload.single("image"), (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.file) {
                res.status(400).json({ status: "error", error: "Görsel dosyası gerekli." });
                return;
            }
            // Dosyayı OpenAI API gereksinimlerine uygun hale getir
            // Kare format, PNG, 4MB'dan küçük
            const processedBuffer = yield (0, sharp_1.default)(req.file.buffer)
                .resize(1024, 1024, { fit: 'cover' }) // Kare format
                .png() // PNG formatına çevir
                .toBuffer();
            const { n, size } = req.body;
            const result = yield (0, aiClient_1.generateImageVariation)({
                imageBuffer: processedBuffer,
                n: n ? parseInt(n) : 1,
                size: size || "1024x1024",
            });
            res.status(result.status === "success" ? 200 : 500).json(result);
        }
        catch (error) {
            res.status(500).json({ status: "error", error: (error === null || error === void 0 ? void 0 : error.message) || "Bilinmeyen hata" });
        }
    }))();
});
