import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const baseURL = "https://api.aimlapi.com/v1";

const openai = new OpenAI({ apiKey: "bd5fa4b533b34eb1aa813f286e47e415", baseURL: baseURL });
// Image variation için doğrudan OpenAI API'sini kullan
const openaiDirect = new OpenAI({ apiKey: "bd5fa4b533b34eb1aa813f286e47e415" });

// Google Gemini AI client
const genAI = new GoogleGenerativeAI("AIzaSyCZHS8hsdsaj5qDwD44tD-LyF8OR9BPgP8"); // Buraya gerçek API key gelecek

const systemPrompt = "You are a travel agent. Be descriptive and helpful";
const userPrompt = "Tell me about San Francisco";


export const main = async () => {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
        temperature: 0.7,
        max_tokens: 256,
    });

    const response = completion.choices[0].message.content;

    console.log("User:", userPrompt);
    console.log("AI:", response);
};

export async function askAIQuestionAnalysis({
    question,
    userAnswer,
    partnerAnswer,
}: {
    question: string;
    userAnswer: string;
    partnerAnswer: string;
}): Promise<{ yorum: string; puan: number; tavsiye: string; status: string; error?: string }> {
    const prompt = `
  Sen bir ilişki uzmanı yapay zekasın. Partnerlerin birbirine sorduğu soruları ve verdikleri cevapları analiz ediyor, yorum yapıyor ve tavsiyede bulunuyorsun.
  
  Aşağıda bir soru, kullanıcının cevabı ve partnerin cevabı verilmiştir. Lütfen aşağıdaki başlıklara göre detaylı analiz yap:
  
  ---
  
  ### Soru:
  ${question}
  
  ### Kullanıcının Cevabı:
  ${userAnswer}
  
  ### Partnerin Cevabı:
  ${partnerAnswer}
  
  ---
  
  ### Analiz Başlıkları:
  
  1. **Soruya Uygunluk:** Partnerin cevabı gerçekten soruya odaklanıyor mu? Gereksiz konulara giriyor mu?
  2. **Duygu ve Samimiyet:** Cevap içten, duygusal ve sıcak mı? Yoksa yüzeysel veya soğuk mu?
  3. **Özen ve Detay:** Partner ne kadar özenli ve detaylı cevaplamış? Üzerinde düşünülmüş mü?
  4. **Empati ve Bağ Kurma:** Partner karşı tarafın duygularını anlamaya çalışıyor mu? İlişkiyi güçlendirecek bir yaklaşım sergiliyor mu?
  
  ---
  
  ### Sonuç:
  
  Önce kısa ama detaylı bir yorum yap.  
  Ardından partnerin cevabına 1 ile 10 arasında bir puan ver.  
  Son olarak ilişkiyi geliştirmek için küçük bir öneri veya tavsiye ver.
  
  Şu formatta cevap ver:
  
  Yorum: [buraya yorum]  
  Puan: [1-10 arası sayı]  
  Tavsiye: [ilişkiyi geliştirecek öneri]  
  `.trim();

    try {
        // openai.images.generate()
        // https://my-love-app.s3.eu-north-1.amazonaws.com/1750928786053-IMG_0111.jpg
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 512,
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || "";

        const yorumMatch = content.match(/Yorum:\s*(.*)\n/);
        const puanMatch = content.match(/Puan:\s*(\d+)/);
        const tavsiyeMatch = content.match(/Tavsiye:\s*(.*)/);

        return {
            yorum: yorumMatch?.[1] || "",
            puan: Number(puanMatch?.[1]) || 0,
            tavsiye: tavsiyeMatch?.[1] || "",
            status: "success",
        };
    } catch (error: any) {
        return {
            yorum: "",
            puan: 0,
            tavsiye: "",
            status: "error",
            error: error?.message || "Bilinmeyen hata",
        };
    }
}

/**
 * Bir PNG dosyasından OpenAI ile varyasyon oluşturur.
 * @param imageBuffer PNG formatında, kare ve 4MB'dan küçük bir görselin buffer'ı
 * @param n Kaç varyasyon istendiği (varsayılan 1)
 * @param size Görsel boyutu ("256x256", "512x512", "1024x1024")
 * @returns {Promise<{ urls: string[], status: string, error?: string; message?: string }>}
 */
export async function generateImageVariation({
    imageBuffer,
    n = 1,
    size = "1024x1024",
}: {
    imageBuffer: Buffer;
    n?: number;
    size?: "256x256" | "512x512" | "1024x1024";
}): Promise<{ urls: string[]; status: string; error?: string; message?: string }> {
    try {
        console.log("=== Image Variation Debug ===");
        console.log("Buffer size:", imageBuffer.length, "bytes");
        console.log("Buffer size in MB:", (imageBuffer.length / (1024 * 1024)).toFixed(2), "MB");
        console.log("Parameters:", { n, size });

        // OpenAI API sadece dall-e-2 modelinde varyasyon destekliyor
        // PNG, kare ve 4MB'dan küçük olmalı
        console.log("Calling OpenAI API...");
        const response = await openaiDirect.images.createVariation({
            image: imageBuffer,
            n,
            size,
            response_format: "url",
            model: "dall-e-2",
        } as any); // openai@5.x types eksik olabilir, bu yüzden as any

        console.log("OpenAI Response:", JSON.stringify(response, null, 2));

        const urls = response?.data?.map((img: any) => img.url).filter(Boolean);
        console.log("Generated URLs:", urls);
        console.log("=== End Debug ===");

        return { urls: urls || [], status: "success" };
    } catch (error: any) {
        console.log("=== Image Variation Error ===");
        console.log("Error type:", typeof error);
        console.log("Error message:", error?.message);
        console.log("Error stack:", error?.stack);
        console.log("Full error object:", JSON.stringify(error, null, 2));
        console.log("=== End Error Debug ===");

        return {
            urls: [],
            status: "error",
            error: error?.message || "Bilinmeyen hata",
        };
    }
}

/**
 * Stable Diffusion API ile görsel oluşturur.
 * @param prompt Görsel açıklaması
 * @param n Kaç görsel istendiği (varsayılan 1)
 * @returns {Promise<{ urls: string[], status: string, error?: string }>}
 */
export async function generateImageWithStableDiffusion({
    prompt,
    n = 1,
}: {
    prompt: string;
    n?: number;
}): Promise<{ urls: string[]; status: string; error?: string }> {
    try {
        console.log("=== Stable Diffusion Image Generation Debug ===");
        console.log("Prompt:", prompt);
        console.log("Number of images:", n);

        // Stable Diffusion API endpoint (örnek)
        const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer sk-b5bQ9xesDRRsWSUv01fQ1g27DdQX8gmBzpSKD4DBhfKaNrgr", // Buraya gerçek API key gelecek
            },
            body: JSON.stringify({
                text_prompts: [
                    {
                        text: prompt,
                        weight: 1
                    }
                ],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: n,
                steps: 30,
            }),
        });

        if (!response.ok) {
            throw new Error(`Stable Diffusion API error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Stable Diffusion Response:", JSON.stringify(result, null, 2));

        // Response'dan image URL'lerini çıkar
        const urls = result.artifacts?.map((artifact: any) => artifact.base64) || [];

        console.log("Generated URLs:", urls);
        console.log("=== End Stable Diffusion Debug ===");

        return { urls, status: "success" };
    } catch (error: any) {
        console.log("=== Stable Diffusion Error ===");
        console.log("Error message:", error?.message);
        console.log("=== End Stable Diffusion Error Debug ===");

        return {
            urls: [],
            status: "error",
            error: error?.message || "Bilinmeyen hata",
        };
    }
}

/**
 * Google Gemini ile görsel oluşturur (Sadece text response, image generation yok).
 * @param prompt Görsel açıklaması
 * @param n Kaç görsel istendiği (varsayılan 1)
 * @returns {Promise<{ urls: string[], status: string, error?: string; message?: string }>}
 */
export async function generateImageWithGemini({
    prompt,
    n = 1,
}: {
    prompt: string;
    n?: number;
}): Promise<{ urls: string[]; status: string; error?: string; message?: string }> {
    try {
        console.log("=== Gemini Image Generation Debug ===");
        console.log("Prompt:", prompt);
        console.log("Number of images:", n);

        // Gemini 1.5 Flash modelini kullan (pro-vision deprecated oldu)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Gemini sadece text response veriyor, image generation yapmıyor
        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log("Gemini Response:", response.text());

        // Gemini image generation yapmıyor, sadece text açıklama veriyor
        const urls: string[] = [];

        console.log("Generated URLs:", urls);
        console.log("=== End Gemini Debug ===");

        return {
            urls,
            status: "success",
            message: "Gemini sadece text response veriyor, image generation yapmıyor. Stable Diffusion veya OpenAI DALL-E kullanın."
        };
    } catch (error: any) {
        console.log("=== Gemini Image Generation Error ===");
        console.log("Error type:", typeof error);
        console.log("Error message:", error?.message);
        console.log("Error stack:", error?.stack);
        console.log("Full error object:", JSON.stringify(error, null, 2));
        console.log("=== End Gemini Error Debug ===");

        return {
            urls: [],
            status: "error",
            error: error?.message || "Bilinmeyen hata",
        };
    }
}
