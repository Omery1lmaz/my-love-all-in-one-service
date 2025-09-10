# Google AI Entegrasyonu

Bu proje artık Google Gemini AI ile entegre edilmiştir. Aşağıda kullanılabilir özellikler ve API endpoint'leri bulunmaktadır.

## Kurulum

1. Google AI API key'inizi `.env` dosyasına ekleyin:
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

2. Gerekli paketler zaten yüklü:
```json
"@google/generative-ai": "^0.24.1"
```

## Özellikler

### 1. AI Sohbet (Google Gemini ile)
- **Endpoint**: `POST /api/ai-chat/sessions/:sessionId/messages`
- **Açıklama**: Google Gemini AI ile sohbet etme
- **Özellikler**:
  - Genel AI sohbet
  - Yaşam koçu sohbeti (İlişki, Kariyer, Sağlık, Kişisel Gelişim, Finansal koçlar)
  - Konuşma geçmişi desteği

### 2. Metin Analizi
- **Endpoint**: `POST /api/ai-chat/analyze/text`
- **Açıklama**: Google AI ile metin analizi
- **Analiz Türleri**:
  - `summary`: Metin özetleme
  - `sentiment`: Duygu analizi
  - `keywords`: Anahtar kelime çıkarma
  - `translation`: Çeviri

**Örnek İstek**:
```json
{
  "text": "Bu metin analiz edilecek...",
  "analysisType": "summary",
  "targetLanguage": "en"
}
```

### 3. Görsel Analizi
- **Endpoint**: `POST /api/ai-chat/analyze/image`
- **Açıklama**: Google AI ile görsel analizi
- **Özellikler**:
  - Görsel içerik analizi
  - Özel prompt desteği

**Örnek İstek**:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "Bu görselde ne görüyorsun? Detaylı olarak açıkla."
}
```

## Yaşam Koçları

Sistemde 5 farklı yaşam koçu bulunmaktadır:

1. **İlişki Koçu** (`relationship_coach`)
   - İlişki problemleri, iletişim, güven konularında uzman

2. **Kariyer Koçu** (`career_coach`)
   - Kariyer gelişimi, iş değişikliği, hedef belirleme

3. **Sağlık Koçu** (`health_coach`)
   - Fiziksel sağlık, beslenme, egzersiz

4. **Kişisel Gelişim Koçu** (`personal_development_coach`)
   - Özgüven, hedef belirleme, yaşam amacı

5. **Finansal Koç** (`financial_coach`)
   - Para yönetimi, bütçe planlama, yatırım

## API Kullanım Örnekleri

### 1. Chat Session Oluşturma
```bash
POST /api/ai-chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Genel Sohbet",
  "coachType": "general"
}
```

### 2. Yaşam Koçu ile Sohbet
```bash
POST /api/ai-chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "İlişki Danışmanlığı",
  "coachType": "life_coach",
  "coachId": "relationship_coach"
}
```

### 3. Mesaj Gönderme
```bash
POST /api/ai-chat/sessions/{sessionId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Merhaba, nasılsın?"
}
```

### 4. Metin Özetleme
```bash
POST /api/ai-chat/analyze/text
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Uzun bir metin burada...",
  "analysisType": "summary"
}
```

### 5. Görsel Analizi
```bash
POST /api/ai-chat/analyze/image
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/photo.jpg",
  "prompt": "Bu fotoğrafta ne görüyorsun?"
}
```

## Güvenlik

- Tüm endpoint'ler JWT token ile korunmaktadır
- API key'ler environment variable'larda saklanmaktadır
- Input validation tüm endpoint'lerde mevcuttur

## Hata Yönetimi

Sistem şu hata durumlarını yönetir:
- Geçersiz API key
- Rate limiting
- Network hataları
- Geçersiz input'lar
- Authentication hataları

## Performans

- Google Gemini 1.5 Flash modeli kullanılmaktadır (hızlı ve verimli)
- Konuşma geçmişi son 10 mesajla sınırlıdır
- Timeout ve retry mekanizmaları mevcuttur

## Geliştirme Notları

- OpenAI ile Google AI arasında kolayca geçiş yapılabilir
- Yeni yaşam koçları kolayca eklenebilir
- Analiz türleri genişletilebilir
- Multimodal özellikler (görsel + metin) desteklenmektedir
