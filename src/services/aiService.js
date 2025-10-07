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
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
class AIService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    generateInsights(healthScoreData, additionalData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                const prompt = `
      Analiz ettiğim ilişki verileri:
      - Genel sağlık skoru: ${healthScoreData.overall}/100
      - İletişim kalitesi: ${healthScoreData.communication}/100
      - Yakınlık seviyesi: ${healthScoreData.intimacy}/100
      - Güven seviyesi: ${healthScoreData.trust}/100
      - Memnuniyet: ${healthScoreData.satisfaction}/100
      - Çatışma çözümü: ${healthScoreData.conflictResolution}/100
      
      Ek veriler:
      - Mesaj sayısı: ${((_a = healthScoreData.dataPoints) === null || _a === void 0 ? void 0 : _a.messageCount) || 0}
      - Ortalama yanıt süresi: ${((_b = healthScoreData.dataPoints) === null || _b === void 0 ? void 0 : _b.responseTime) || 0} dakika
      - Pozitif sentiment: ${((_c = healthScoreData.dataPoints) === null || _c === void 0 ? void 0 : _c.positiveSentiment) || 0}%
      - Aktivite katılımı: ${((_d = healthScoreData.dataPoints) === null || _d === void 0 ? void 0 : _d.activityEngagement) || 0}
      - Çatışma sayısı: ${((_e = healthScoreData.dataPoints) === null || _e === void 0 ? void 0 : _e.conflictCount) || 0}
      
      Bu verilere dayanarak aşağıdaki formatta 3-5 içgörü oluştur:
      
      Her içgörü için:
      1. type: "positive" | "warning" | "suggestion" | "achievement"
      2. title: Kısa ve net başlık (Türkçe)
      3. description: Detaylı açıklama (Türkçe)
      4. impact: "low" | "medium" | "high"
      5. category: "communication" | "intimacy" | "trust" | "activities" | "conflict"
      6. actionable: true/false
      7. actionItems: Somut aksiyon planları (Türkçe array)
      8. confidence: 0-100 arası güven skoru
      
      JSON formatında yanıtla, sadece insights array'ini döndür.
      
      Türkçe olarak, çiftlere yönelik, yapıcı ve destekleyici bir tonla yanıtla.
      `;
                const response = yield this.openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1500
                });
                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('AI response is empty');
                }
                // Parse JSON response
                const insights = JSON.parse(content);
                return insights;
            }
            catch (error) {
                console.error('Error generating AI insights:', error);
                throw error;
            }
        });
    }
    analyzeSentiment(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (messages.length === 0) {
                    return { positive: 0, neutral: 0, negative: 0 };
                }
                const messageTexts = messages.map(msg => msg.content || '').join('\n');
                const prompt = `
      Aşağıdaki mesajları analiz et ve sentiment dağılımını hesapla:
      
      ${messageTexts}
      
      JSON formatında yanıtla:
      {
        "positive": yüzde,
        "neutral": yüzde,
        "negative": yüzde
      }
      
      Toplam 100% olmalı.
      `;
                const response = yield this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 200
                });
                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('AI response is empty');
                }
                return JSON.parse(content);
            }
            catch (error) {
                console.error('Error analyzing sentiment:', error);
                // Fallback to simple analysis
                return this.simpleSentimentAnalysis(messages);
            }
        });
    }
    generateRecommendations(healthScore, trends) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = `
      İlişki sağlık skorları:
      - Genel: ${healthScore.overall}/100
      - İletişim: ${healthScore.communication}/100
      - Yakınlık: ${healthScore.intimacy}/100
      - Güven: ${healthScore.trust}/100
      - Memnuniyet: ${healthScore.satisfaction}/100
      - Çatışma çözümü: ${healthScore.conflictResolution}/100
      
      Trend verileri: ${JSON.stringify(trends)}
      
      Bu verilere dayanarak öneriler oluştur:
      
      JSON formatında yanıtla:
      {
        "immediate": ["1 hafta içinde yapılabilecek öneriler"],
        "shortTerm": ["1 ay içinde yapılabilecek öneriler"],
        "longTerm": ["3-6 ay içinde yapılabilecek öneriler"]
      }
      
      Her kategoride 3-5 öneri olmalı.
      Türkçe olarak, somut ve uygulanabilir öneriler ver.
      `;
                const response = yield this.openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 800
                });
                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('AI response is empty');
                }
                return JSON.parse(content);
            }
            catch (error) {
                console.error('Error generating recommendations:', error);
                return {
                    immediate: ['Daha sık iletişim kurun', 'Günlük sohbet rutini oluşturun'],
                    shortTerm: ['Ortak aktiviteler planlayın', 'Haftalık değerlendirme yapın'],
                    longTerm: ['İlişki hedefleri belirleyin', 'Profesyonel destek almayı düşünün']
                };
            }
        });
    }
    generateReportSummary(reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = `
      İlişki raporu verileri:
      ${JSON.stringify(reportData, null, 2)}
      
      Bu verilere dayanarak 2-3 paragraf halinde özet oluştur.
      Pozitif yönleri vurgula, gelişim alanlarını yapıcı şekilde belirt.
      Türkçe olarak, çiftlere yönelik destekleyici bir tonla yaz.
      `;
                const response = yield this.openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 500
                });
                return response.choices[0].message.content || 'Rapor özeti oluşturulamadı.';
            }
            catch (error) {
                console.error('Error generating report summary:', error);
                return 'Bu dönemde ilişkinizde önemli gelişmeler yaşandı. İletişim kalitenizi artırmaya ve ortak aktivitelerinizi çeşitlendirmeye devam edin.';
            }
        });
    }
    analyzeCommunicationPatterns(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (messages.length === 0) {
                    return {
                        frequency: { daily: 0, weekly: 0, monthly: 0 },
                        quality: { positive: 0, neutral: 0, negative: 0 },
                        topics: { romantic: 0, daily: 0, future: 0, problems: 0, fun: 0 }
                    };
                }
                const messageTexts = messages.map(msg => msg.content || '').join('\n');
                const prompt = `
      Aşağıdaki mesajları analiz et ve iletişim kalıplarını çıkar:
      
      ${messageTexts}
      
      JSON formatında yanıtla:
      {
        "frequency": {
          "daily": günlük mesaj sayısı,
          "weekly": haftalık mesaj sayısı,
          "monthly": aylık mesaj sayısı
        },
        "quality": {
          "positive": pozitif mesaj yüzdesi,
          "neutral": nötr mesaj yüzdesi,
          "negative": negatif mesaj yüzdesi
        },
        "topics": {
          "romantic": romantik konu yüzdesi,
          "daily": günlük konu yüzdesi,
          "future": gelecek konu yüzdesi,
          "problems": sorun konu yüzdesi,
          "fun": eğlence konu yüzdesi
        }
      }
      `;
                const response = yield this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 400
                });
                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('AI response is empty');
                }
                return JSON.parse(content);
            }
            catch (error) {
                console.error('Error analyzing communication patterns:', error);
                return {
                    frequency: { daily: 0, weekly: 0, monthly: 0 },
                    quality: { positive: 0, neutral: 0, negative: 0 },
                    topics: { romantic: 0, daily: 0, future: 0, problems: 0, fun: 0 }
                };
            }
        });
    }
    simpleSentimentAnalysis(messages) {
        const positiveWords = ['love', 'happy', 'great', 'amazing', 'wonderful', 'beautiful', 'sevgili', 'mutlu', 'harika', 'güzel', 'mükemmel'];
        const negativeWords = ['hate', 'angry', 'sad', 'terrible', 'awful', 'nefret', 'kızgın', 'üzgün', 'kötü', 'berbat'];
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        for (const message of messages) {
            const content = (message.content || '').toLowerCase();
            const positiveWordsFound = positiveWords.filter(word => content.includes(word)).length;
            const negativeWordsFound = negativeWords.filter(word => content.includes(word)).length;
            if (positiveWordsFound > negativeWordsFound) {
                positiveCount++;
            }
            else if (negativeWordsFound > positiveWordsFound) {
                negativeCount++;
            }
            else {
                neutralCount++;
            }
        }
        const total = messages.length;
        return {
            positive: Math.round((positiveCount / total) * 100),
            neutral: Math.round((neutralCount / total) * 100),
            negative: Math.round((negativeCount / total) * 100)
        };
    }
}
exports.AIService = AIService;
