import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const baseURL = "https://api.aimlapi.com/v1";

const openai = new OpenAI({
  apiKey: "bd5fa4b533b34eb1aa813f286e47e415",
  baseURL: baseURL,
});
// Image variation için doğrudan OpenAI API'sini kullan
const openaiDirect = new OpenAI({ apiKey: "bd5fa4b533b34eb1aa813f286e47e415" });

// Google Gemini AI client
const genAI = new GoogleGenAI({
  apiKey:
    process.env.GOOGLE_AI_API_KEY || "AIzaSyBpiBChIKVBeUtcQSvuvVt-Rw2B634P6eM",
});

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
}): Promise<{
  yorum: string;
  puan: number;
  tavsiye: string;
  status: string;
  error?: string;
}> {
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
}): Promise<{
  urls: string[];
  status: string;
  error?: string;
  message?: string;
}> {
  try {
    console.log("=== Image Variation Debug ===");
    console.log("Buffer size:", imageBuffer.length, "bytes");
    console.log(
      "Buffer size in MB:",
      (imageBuffer.length / (1024 * 1024)).toFixed(2),
      "MB"
    );
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
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer sk-b5bQ9xesDRRsWSUv01fQ1g27DdQX8gmBzpSKD4DBhfKaNrgr", // Buraya gerçek API key gelecek
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: n,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Stable Diffusion API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Stable Diffusion Response:", JSON.stringify(result, null, 2));

    // Response'dan image URL'lerini çıkar
    const urls =
      result.artifacts?.map((artifact: any) => artifact.base64) || [];

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
}): Promise<{
  urls: string[];
  status: string;
  error?: string;
  message?: string;
}> {
  try {
    console.log("=== Gemini Image Generation Debug ===");
    console.log("Prompt:", prompt);
    console.log("Number of images:", n);

    // Gemini 1.5 Pro modelini kullan
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const response = result;

    console.log("Gemini Response:", response.text);

    // Gemini image generation yapmıyor, sadece text açıklama veriyor
    const urls: string[] = [];

    console.log("Generated URLs:", urls);
    console.log("=== End Gemini Debug ===");

    return {
      urls,
      status: "success",
      message:
        "Gemini sadece text response veriyor, image generation yapmıyor. Stable Diffusion veya OpenAI DALL-E kullanın.",
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

/**
 * AI ile sohbet etmek için kullanılan fonksiyon
 * @param message Kullanıcının mesajı
 * @param conversationHistory Önceki konuşma geçmişi
 * @returns {Promise<{ response: string; status: string; error?: string }>}
 */
export async function chatWithAI({
  message,
  conversationHistory = [],
}: {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{ response: string; status: string; error?: string }> {
  try {
    const systemPrompt = `Sen samimi, yardımsever ve bilgili bir AI asistanısın. 
        Kullanıcıların sorularını yanıtlar, sohbet eder ve onlara yardımcı olursun. 
        Türkçe konuşuyorsun ve doğal, arkadaşça bir tonda yanıt veriyorsun. 
        Kısa ve öz yanıtlar ver, ama gerektiğinde detaylı açıklamalar yap.`;

    // Konuşma geçmişini mesaj formatına çevir
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Üzgünüm, şu anda yanıt veremiyorum.";

    return {
      response,
      status: "success",
    };
  } catch (error: any) {
    console.error("AI sohbet hatası:", error);
    return {
      response:
        "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

// Yaşam Koçları için uzmanlık alanları
export const LIFE_COACHES = {
  RELATIONSHIP_COACH: {
    id: "relationship_coach",
    name: "İlişki Koçu",
    description:
      "İlişki problemleri, iletişim, güven ve romantik bağlar konusunda uzman",
    systemPrompt: `Sen deneyimli bir İlişki Koçusun. İlişki problemleri, iletişim becerileri, güven sorunları ve romantik bağlar konusunda uzmansın.

Uzmanlık Alanların:
- İlişki problemlerini çözme
- Etkili iletişim teknikleri
- Güven ve bağlanma sorunları
- Çatışma çözümü
- Romantik ilişkilerde büyüme
- Partner ile uyum sağlama

Yaklaşımın:
- Empatik ve destekleyici ol
- Pratik öneriler ver
- Kişisel deneyimlerini paylaş
- Güvenli bir ortam yarat
- Yargılamadan dinle
- Yapıcı geri bildirim ver

Türkçe konuş ve doğal, samimi bir tonda yanıt ver. Kısa ama etkili öneriler sun.`,
  },

  CAREER_COACH: {
    id: "career_coach",
    name: "Kariyer Koçu",
    description:
      "Kariyer gelişimi, iş değişikliği, hedef belirleme ve profesyonel büyüme konusunda uzman",
    systemPrompt: `Sen deneyimli bir Kariyer Koçusun. Kariyer gelişimi, iş değişikliği, hedef belirleme ve profesyonel büyüme konusunda uzmansın.

Uzmanlık Alanların:
- Kariyer planlama ve hedef belirleme
- İş değişikliği ve geçiş süreçleri
- CV ve mülakat hazırlığı
- Networking ve kişisel marka
- Liderlik ve yönetim becerileri
- İş-yaşam dengesi

Yaklaşımın:
- Stratejik düşün
- Somut adımlar öner
- Motivasyonu artır
- Güçlü yanları vurgula
- Zorlukları fırsata çevir
- Uzun vadeli planlama yap

Türkçe konuş ve profesyonel ama samimi bir tonda yanıt ver. Pratik ve uygulanabilir öneriler sun.`,
  },

  HEALTH_COACH: {
    id: "health_coach",
    name: "Sağlık Koçu",
    description:
      "Fiziksel sağlık, beslenme, egzersiz ve yaşam tarzı değişiklikleri konusunda uzman",
    systemPrompt: `Sen deneyimli bir Sağlık Koçusun. Fiziksel sağlık, beslenme, egzersiz ve yaşam tarzı değişiklikleri konusunda uzmansın.

Uzmanlık Alanların:
- Beslenme ve diyet planlama
- Egzersiz programları
- Stres yönetimi
- Uyku düzeni
- Mental sağlık
- Sürdürülebilir yaşam tarzı değişiklikleri

Yaklaşımın:
- Bilimsel temelli öneriler ver
- Kişiselleştirilmiş planlar oluştur
- Küçük adımlarla başla
- Motivasyonu sürdür
- Sağlıklı alışkanlıklar geliştir
- Dengeyi koru

Türkçe konuş ve enerjik, destekleyici bir tonda yanıt ver. Sağlık hedeflerine ulaşmak için pratik öneriler sun.`,
  },

  PERSONAL_DEVELOPMENT_COACH: {
    id: "personal_development_coach",
    name: "Kişisel Gelişim Koçu",
    description:
      "Kişisel gelişim, özgüven, hedef belirleme ve yaşam amacı konusunda uzman",
    systemPrompt: `Sen deneyimli bir Kişisel Gelişim Koçusun. Kişisel gelişim, özgüven, hedef belirleme ve yaşam amacı konusunda uzmansın.

Uzmanlık Alanların:
- Özgüven geliştirme
- Kişisel hedef belirleme
- Zaman yönetimi
- Stres ve kaygı yönetimi
- Yaşam amacı keşfi
- Kişisel sınırlar ve değerler

Yaklaşımın:
- İçsel gücü ortaya çıkar
- Farkındalık yarat
- Kişisel değerleri keşfet
- Büyüme zihniyeti geliştir
- Cesaretlendir ve destekle
- Sürdürülebilir değişim sağla

Türkçe konuş ve ilham verici, destekleyici bir tonda yanıt ver. Kişisel büyüme için derinlemesine rehberlik sun.`,
  },

  FINANCIAL_COACH: {
    id: "financial_coach",
    name: "Finansal Koç",
    description:
      "Para yönetimi, bütçe planlama, yatırım ve finansal hedefler konusunda uzman",
    systemPrompt: `Sen deneyimli bir Finansal Koçsun. Para yönetimi, bütçe planlama, yatırım ve finansal hedefler konusunda uzmansın.

Uzmanlık Alanların:
- Bütçe planlama ve para yönetimi
- Tasarruf stratejileri
- Borç yönetimi
- Yatırım planlama
- Finansal hedef belirleme
- Emeklilik planlama

Yaklaşımın:
- Pratik finansal öneriler ver
- Kişisel duruma göre planla
- Küçük adımlarla başla
- Finansal okuryazarlık geliştir
- Uzun vadeli düşün
- Güvenli ve sürdürülebilir stratejiler öner

Türkçe konuş ve güvenilir, profesyonel bir tonda yanıt ver. Finansal özgürlük için somut adımlar sun.`,
  },
};

/**
 * Belirli bir yaşam koçu ile sohbet etmek için kullanılan fonksiyon
 * @param message Kullanıcının mesajı
 * @param coachId Koç ID'si
 * @param conversationHistory Önceki konuşma geçmişi
 * @returns {Promise<{ response: string; status: string; error?: string }>}
 */
export async function chatWithLifeCoach({
  message,
  coachId,
  conversationHistory = [],
}: {
  message: string;
  coachId: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{ response: string; status: string; error?: string }> {
  try {
    console.log(coachId, "coachId");
    const coach = Object.values(LIFE_COACHES).find((c) => c.id === coachId);

    if (!coach) {
      return {
        response: "Üzgünüm, belirtilen koç bulunamadı.",
        status: "error",
        error: "Geçersiz koç ID'si",
      };
    }

    // Koçun sistem promptunu kullan
    const systemPrompt = coach.systemPrompt;

    // Konuşma geçmişini mesaj formatına çevir
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Üzgünüm, şu anda yanıt veremiyorum.";

    return {
      response,
      status: "success",
    };
  } catch (error: any) {
    console.error("Yaşam koçu sohbet hatası:", error);
    return {
      response:
        "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

/**
 * Mevcut yaşam koçlarını listeler
 * @returns {Array} Koç listesi
 */
export function getAvailableLifeCoaches() {
  return Object.values(LIFE_COACHES).map((coach) => ({
    id: coach.id,
    name: coach.name,
    description: coach.description,
  }));
}

/**
 * Google Gemini AI ile sohbet etmek için kullanılan fonksiyon
 * @param message Kullanıcının mesajı
 * @param conversationHistory Önceki konuşma geçmişi
 * @returns {Promise<{ response: string; status: string; error?: string }>}
 */
export async function chatWithGoogleAI({
  message,
  conversationHistory = [],
}: {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{ response: string; status: string; error?: string }> {
  try {
    // Konuşma geçmişini Gemini formatına çevir
    const contents = [];
    
    // History'yi contents formatına çevir
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    
    // Son mesajı ekle
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });
    
    const text = result.text || "Üzgünüm, şu anda yanıt veremiyorum.";

    return {
      response: text,
      status: "success",
    };
  } catch (error: any) {
    console.error("Google AI sohbet hatası:", error);
    return {
      response:
        "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

/**
 * Google Gemini AI ile yaşam koçu sohbeti
 * @param message Kullanıcının mesajı
 * @param coachId Koç ID'si
 * @param conversationHistory Önceki konuşma geçmişi
 * @returns {Promise<{ response: string; status: string; error?: string }>}
 */
export async function chatWithGoogleLifeCoach({
  message,
  coachId,
  conversationHistory = [],
}: {
  message: string;
  coachId: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{ response: string; status: string; error?: string }> {
  try {
    const coach = Object.values(LIFE_COACHES).find((c) => c.id === coachId);

    if (!coach) {
      return {
        response: "Üzgünüm, belirtilen koç bulunamadı.",
        status: "error",
        error: "Geçersiz koç ID'si",
      };
    }

    // Konuşma geçmişini Gemini formatına çevir
    const contents = [];
    
    // System instruction'ı ekle
    contents.push({
      role: "user",
      parts: [{ text: coach.systemPrompt }],
    });
    
    // History'yi contents formatına çevir
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    
    // Son mesajı ekle
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });
    
    const text = result.text || "Üzgünüm, şu anda yanıt veremiyorum.";

    return {
      response: text,
      status: "success",
    };
  } catch (error: any) {
    console.error("Google AI yaşam koçu sohbet hatası:", error);
    return {
      response:
        "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

/**
 * Google Gemini AI ile streaming sohbet
 * @param message Kullanıcının mesajı
 * @param conversationHistory Önceki konuşma geçmişi
 * @returns {AsyncGenerator<string>} Streaming response
 */
export async function* chatWithGoogleAIStream({
  message,
  conversationHistory = [],
}: {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): AsyncGenerator<string> {
  try {
    // Konuşma geçmişini Gemini formatına çevir
    const contents = [];
    
    // History'yi contents formatına çevir
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    
    // Son mesajı ekle
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: contents,
    });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error: any) {
    console.error("Google AI streaming sohbet hatası:", error);
    yield "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
  }
}

/**
 * Google Gemini AI ile streaming yaşam koçu sohbeti
 * @param message Kullanıcının mesajı
 * @param coachId Koç ID'si
 * @param conversationHistory Önceki konuşma geçmişi
 * @returns {AsyncGenerator<string>} Streaming response
 */
export async function* chatWithGoogleLifeCoachStream({
  message,
  coachId,
  conversationHistory = [],
}: {
  message: string;
  coachId: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): AsyncGenerator<string> {
  try {
    const coach = Object.values(LIFE_COACHES).find((c) => c.id === coachId);

    if (!coach) {
      yield "Üzgünüm, belirtilen koç bulunamadı.";
      return;
    }

    // Konuşma geçmişini Gemini formatına çevir
    const contents = [];
    
    // System instruction'ı ekle
    contents.push({
      role: "user",
      parts: [{ text: coach.systemPrompt }],
    });
    
    // History'yi contents formatına çevir
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    
    // Son mesajı ekle
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: contents,
    });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error: any) {
    console.error("Google AI streaming yaşam koçu sohbet hatası:", error);
    yield "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
  }
}

/**
 * Google Gemini AI ile metin analizi ve özetleme
 * @param text Analiz edilecek metin
 * @param analysisType Analiz türü ('summary', 'sentiment', 'keywords', 'translation')
 * @param targetLanguage Hedef dil (çeviri için)
 * @returns {Promise<{ result: string; status: string; error?: string }>}
 */
export async function analyzeTextWithGoogleAI({
  text,
  analysisType = "summary",
  targetLanguage = "tr",
}: {
  text: string;
  analysisType?: "summary" | "sentiment" | "keywords" | "translation";
  targetLanguage?: string;
}): Promise<{ result: string; status: string; error?: string }> {
  try {
    let prompt = "";

    switch (analysisType) {
      case "summary":
        prompt = `Aşağıdaki metni Türkçe olarak özetle, ana noktaları vurgula:\n\n${text}`;
        break;
      case "sentiment":
        prompt = `Aşağıdaki metnin duygu analizini yap (pozitif, negatif, nötr) ve kısa bir açıklama ver:\n\n${text}`;
        break;
      case "keywords":
        prompt = `Aşağıdaki metinden anahtar kelimeleri çıkar ve listele:\n\n${text}`;
        break;
      case "translation":
        prompt = `Aşağıdaki metni ${targetLanguage} diline çevir:\n\n${text}`;
        break;
      default:
        prompt = `Aşağıdaki metni analiz et:\n\n${text}`;
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const analyzedText = result.text || "";

    return {
      result: analyzedText,
      status: "success",
    };
  } catch (error: any) {
    console.error("Google AI metin analizi hatası:", error);
    return {
      result: "",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

/**
 * Google Gemini AI ile görsel analizi (görsel URL'si ile)
 * @param imageUrl Analiz edilecek görselin URL'si
 * @param prompt Görsel hakkında sorulacak soru
 * @returns {Promise<{ result: string; status: string; error?: string }>}
 */
export async function analyzeImageWithGoogleAI({
  imageUrl,
  prompt = "Bu görselde ne görüyorsun? Detaylı olarak açıkla.",
}: {
  imageUrl: string;
  prompt?: string;
}): Promise<{ result: string; status: string; error?: string }> {
  try {
    // Görseli fetch et
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    const analyzedText = result.text || "";

    return {
      result: analyzedText,
      status: "success",
    };
  } catch (error: any) {
    console.error("Google AI görsel analizi hatası:", error);
    return {
      result: "",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

/**
 * Google Gemini AI ile resim analizi yapıp, analiz sonucuna göre yeni resim çizdirme
 * @param imageBuffer Analiz edilecek resmin buffer'ı
 * @param mimeType Resim mime type'ı
 * @param style Çizim stili (realistic, cartoon, anime, watercolor, oil_painting, digital_art)
 * @param additionalPrompt Ek prompt (opsiyonel)
 * @returns {Promise<{ analysis: string; generatedImageBase64: string; status: string; error?: string }>}
 */
export async function analyzeAndGenerateImage({
  imageBuffer,
  mimeType,
  style = "realistic",
  additionalPrompt = "",
}: {
  imageBuffer: Buffer;
  mimeType: string;
  style?: "realistic" | "cartoon" | "anime" | "watercolor" | "oil_painting" | "digital_art";
  additionalPrompt?: string;
}): Promise<{ 
  analysis: string; 
  generatedImageBase64: string; 
  status: string; 
  error?: string 
}> {
  try {
    console.log("=== Analyze and Generate Image Debug ===");
    console.log("Image Buffer size:", imageBuffer.length);
    console.log("Mime Type:", mimeType);
    console.log("Style:", style);
    console.log("Additional Prompt:", additionalPrompt);

    // 1. Adım: Resmi analiz et
    const analysisPrompt = `Bu resmi detaylı olarak analiz et. Resimde ne görüyorsun? Renkler, kompozisyon, objeler, atmosfer, duygu ve stil hakkında kapsamlı bir açıklama yap. Bu analizi kullanarak benzer bir resim çizilecek.`;
    
    const base64Image = imageBuffer.toString("base64");
    
    const analysisResult = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });

    const analysis = analysisResult.text || "";
    console.log("Analysis Result:", analysis);

    // 2. Adım: Analiz sonucuna göre prompt oluştur
    const stylePrompts = {
      realistic: "photorealistic, high quality, detailed, professional photography",
      cartoon: "cartoon style, colorful, fun, animated, Disney-like",
      anime: "anime style, manga, Japanese animation, vibrant colors",
      watercolor: "watercolor painting, soft colors, artistic, hand-painted",
      oil_painting: "oil painting, classical art, brushstrokes, artistic masterpiece",
      digital_art: "digital art, concept art, fantasy, high resolution, detailed"
    };

    const stylePrompt = stylePrompts[style] || stylePrompts.realistic;
    
    const imageGenerationPrompt = `Create a new image based on this analysis: "${analysis}". 
    Style: ${stylePrompt}. 
    ${additionalPrompt ? `Additional requirements: ${additionalPrompt}` : ""}
    
    Generate a completely new and unique image that captures the essence and mood of the original but is distinctly different.`;

    console.log("Image Generation Prompt:", imageGenerationPrompt);

    // 3. Adım: Google Gemini ile yeni resim oluştur
    const config = {
      responseModalities: [
        'IMAGE',
        'TEXT',
      ],
    };

    const response = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash-exp",
      config,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: imageGenerationPrompt,
            },
          ],
        },
      ],
    });

    let generatedImageBase64 = "";
    let generatedText = "";

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        generatedImageBase64 = inlineData.data || "";
        console.log("Generated Image Base64 length:", generatedImageBase64.length);
      } else if (chunk.text) {
        generatedText += chunk.text;
      }
    }

    if (!generatedImageBase64) {
      throw new Error("Resim oluşturulamadı");
    }

    console.log("Generated Text:", generatedText);
    console.log("=== End Analyze and Generate Image Debug ===");

    return {
      analysis,
      generatedImageBase64,
      status: "success",
    };

  } catch (error: any) {
    console.error("=== Analyze and Generate Image Error ===");
    console.error("Error:", error);
    console.error("=== End Error Debug ===");

    return {
      analysis: "",
      generatedImageBase64: "",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}

/**
 * Google Gemini AI ile resim analizi yapıp, analiz sonucuna göre Stable Diffusion ile yeni resim çizdirme
 * @param imageUrl Analiz edilecek resmin URL'si
 * @param style Çizim stili
 * @param additionalPrompt Ek prompt (opsiyonel)
 * @returns {Promise<{ analysis: string; generatedImageBase64: string; status: string; error?: string }>}
 */
export async function analyzeAndGenerateImageWithStableDiffusion({
  imageUrl,
  style = "realistic",
  additionalPrompt = "",
}: {
  imageUrl: string;
  style?: "realistic" | "cartoon" | "anime" | "watercolor" | "oil_painting" | "digital_art";
  additionalPrompt?: string;
}): Promise<{ 
  analysis: string; 
  generatedImageBase64: string; 
  status: string; 
  error?: string 
}> {
  try {
    console.log("=== Analyze and Generate Image with Stable Diffusion Debug ===");
    console.log("Image URL:", imageUrl);
    console.log("Style:", style);
    console.log("Additional Prompt:", additionalPrompt);

    // 1. Adım: Resmi analiz et
    const analysisPrompt = `Bu resmi detaylı olarak analiz et. Resimde ne görüyorsun? Renkler, kompozisyon, objeler, atmosfer, duygu ve stil hakkında kapsamlı bir açıklama yap. Bu analizi kullanarak benzer bir resim çizilecek.`;
    
    const analysisResult = await analyzeImageWithGoogleAI({
      imageUrl,
      prompt: analysisPrompt,
    });

    if (analysisResult.status !== "success") {
      throw new Error("Resim analizi başarısız: " + analysisResult.error);
    }

    const analysis = analysisResult.result;
    console.log("Analysis Result:", analysis);

    // 2. Adım: Analiz sonucuna göre prompt oluştur
    const stylePrompts = {
      realistic: "photorealistic, high quality, detailed, professional photography",
      cartoon: "cartoon style, colorful, fun, animated, Disney-like",
      anime: "anime style, manga, Japanese animation, vibrant colors",
      watercolor: "watercolor painting, soft colors, artistic, hand-painted",
      oil_painting: "oil painting, classical art, brushstrokes, artistic masterpiece",
      digital_art: "digital art, concept art, fantasy, high resolution, detailed"
    };

    const stylePrompt = stylePrompts[style] || stylePrompts.realistic;
    
    const imageGenerationPrompt = `Create a new image based on this analysis: "${analysis}". 
    Style: ${stylePrompt}. 
    ${additionalPrompt ? `Additional requirements: ${additionalPrompt}` : ""}
    
    Generate a completely new and unique image that captures the essence and mood of the original but is distinctly different.`;

    console.log("Stable Diffusion Prompt:", imageGenerationPrompt);

    // 3. Adım: Stable Diffusion ile yeni resim oluştur
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-b5bQ9xesDRRsWSUv01fQ1g27DdQX8gmBzpSKD4DBhfKaNrgr",
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: imageGenerationPrompt,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Stable Diffusion API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Stable Diffusion Response:", JSON.stringify(result, null, 2));

    const generatedImageBase64 = result.artifacts?.[0]?.base64;
    
    if (!generatedImageBase64) {
      throw new Error("Resim oluşturulamadı");
    }

    console.log("Generated Image Base64 length:", generatedImageBase64.length);
    console.log("=== End Analyze and Generate Image with Stable Diffusion Debug ===");

    return {
      analysis,
      generatedImageBase64,
      status: "success",
    };

  } catch (error: any) {
    console.error("=== Analyze and Generate Image with Stable Diffusion Error ===");
    console.error("Error:", error);
    console.error("=== End Error Debug ===");

    return {
      analysis: "",
      generatedImageBase64: "",
      status: "error",
      error: error?.message || "Bilinmeyen hata",
    };
  }
}
