import express from "express";
import multer from "multer";
import sharp from "sharp";
import { generateImageVariation } from "../utils/aiClient";

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB'a çıkaralım, sonra küçülteceğiz
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
      return cb(new Error("Sadece PNG veya JPEG dosyası yükleyin."));
    }
    cb(null, true);
  },
});

router.post("/api/ai/image-variation", upload.single("image"), (req, res) => {
  (async () => {
    try {
      if (!req.file) {
        res.status(400).json({ status: "error", error: "Görsel dosyası gerekli." });
        return;
      }

      // Dosyayı OpenAI API gereksinimlerine uygun hale getir
      // Kare format, PNG, 4MB'dan küçük
      const processedBuffer = await sharp(req.file.buffer)
        .resize(1024, 1024, { fit: 'cover' }) // Kare format
        .png() // PNG formatına çevir
        .toBuffer();

      const { n, size } = req.body;
      const result = await generateImageVariation({
        imageBuffer: processedBuffer,
        n: n ? parseInt(n) : 1,
        size: size || "1024x1024",
      });
      res.status(result.status === "success" ? 200 : 500).json(result);
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error?.message || "Bilinmeyen hata" });
    }
  })();
});

export { router as generateImageVariationRouter }; 