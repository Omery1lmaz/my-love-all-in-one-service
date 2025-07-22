import express from "express";
import { generateImageWithGemini } from "../utils/aiClient";

const router = express.Router();

router.post("/api/ai/gemini-image", async (req, res) => {
  (async () => {
    try {
      const { prompt, n } = req.body;
      
      if (!prompt) {
        res.status(400).json({ status: "error", error: "Prompt gerekli." });
        return;
      }

      const result = await generateImageWithGemini({
        prompt,
        n: n ? parseInt(n) : 1,
      });
      
      res.status(result.status === "success" ? 200 : 500).json(result);
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error?.message || "Bilinmeyen hata" });
    }
  })();
});

export { router as generateImageWithGeminiRouter }; 