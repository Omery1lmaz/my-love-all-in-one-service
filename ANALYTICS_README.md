# İlişki Analizi Sistemi - Backend API Dokümantasyonu

## 🎯 Genel Bakış

MyLove uygulaması için geliştirilmiş İlişki Analizi Sistemi, çiftlerin ilişki sağlığını analiz eder, AI destekli öneriler sunar ve gelişim hedefleri takip eder.

## 🏗️ Sistem Mimarisi

### Modeller
- **HealthScore**: İlişki sağlık skorları ve veri noktaları
- **Goal**: İlişki hedefleri ve ilerleme takibi
- **Insight**: AI destekli içgörüler ve öneriler
- **Report**: Haftalık/aylık/çeyreklik raporlar

### Servisler
- **AnalyticsService**: Ana analiz motoru
- **AIService**: OpenAI GPT entegrasyonu
- **NotificationService**: Push notification sistemi

### Utils
- **CalculationUtils**: Skor hesaplama algoritmaları
- **DateUtils**: Tarih işlemleri ve yardımcı fonksiyonlar

## 📊 API Endpoint'leri

### Health Score Endpoints

#### GET /api/analytics/health-score
Mevcut sağlık skorunu getirir.

**Query Parameters:**
- `partnerId` (required): Partner kullanıcı ID'si

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": 85,
    "communication": 80,
    "intimacy": 90,
    "trust": 85,
    "satisfaction": 88,
    "conflictResolution": 82,
    "calculatedAt": "2024-01-15T10:30:00Z",
    "dataPoints": {
      "messageCount": 150,
      "responseTime": 45,
      "positiveSentiment": 85,
      "activityEngagement": 25,
      "conflictCount": 2,
      "moodScores": [8, 7, 9, 8, 9]
    }
  }
}
```

#### POST /api/analytics/health-score/calculate
Yeni sağlık skoru hesaplar.

**Request Body:**
```json
{
  "partnerId": "partner_user_id"
}
```

#### GET /api/analytics/health-score/history
Sağlık skoru geçmişini getirir.

**Query Parameters:**
- `partnerId` (required): Partner kullanıcı ID'si
- `limit` (optional): Sonuç sayısı (default: 30, max: 100)

#### GET /api/analytics/health-score/trends
Sağlık skoru trendlerini analiz eder.

**Query Parameters:**
- `partnerId` (required): Partner kullanıcı ID'si
- `days` (optional): Analiz edilecek gün sayısı (default: 30, max: 365)

### Goals Endpoints

#### GET /api/analytics/goals
Kullanıcının hedeflerini getirir.

**Query Parameters:**
- `partnerId` (required): Partner kullanıcı ID'si
- `status` (optional): Hedef durumu (active, completed, paused, failed)

#### POST /api/analytics/goals
Yeni hedef oluşturur.

**Request Body:**
```json
{
  "partnerId": "partner_user_id",
  "title": "Daha İyi İletişim",
  "description": "Günlük sohbet rutini oluşturmak",
  "category": "communication",
  "targetValue": 30,
  "deadline": "2024-02-15T00:00:00Z",
  "milestones": [
    {
      "title": "Haftalık değerlendirme",
      "completed": false
    }
  ]
}
```

#### PUT /api/analytics/goals/:id
Hedef günceller.

#### POST /api/analytics/goals/:id/progress
Hedef ilerlemesi günceller.

**Request Body:**
```json
{
  "currentValue": 15
}
```

#### DELETE /api/analytics/goals/:id
Hedef siler.

### Insights Endpoints

#### GET /api/analytics/insights
İçgörüleri getirir.

**Query Parameters:**
- `partnerId` (required): Partner kullanıcı ID'si
- `type` (optional): İçgörü tipi (positive, warning, suggestion, achievement)
- `limit` (optional): Sonuç sayısı (default: 20, max: 100)

#### POST /api/analytics/insights/generate
Temel içgörüler oluşturur.

#### POST /api/analytics/insights/ai-generate
AI destekli içgörüler oluşturur.

#### PUT /api/analytics/insights/:id/read
İçgörüyü okundu olarak işaretler.

#### PUT /api/analytics/insights/:id/applied
İçgörüyü uygulandı olarak işaretler.

#### PUT /api/analytics/insights/:id/dismiss
İçgörüyü reddeder.

### Reports Endpoints

#### GET /api/analytics/reports/weekly
Haftalık rapor getirir.

#### POST /api/analytics/reports/weekly/generate
Haftalık rapor oluşturur.

#### GET /api/analytics/reports/monthly
Aylık rapor getirir.

#### POST /api/analytics/reports/monthly/generate
Aylık rapor oluşturur.

#### GET /api/analytics/reports/:id
Rapor detaylarını getirir.

#### POST /api/analytics/reports/:id/summary
AI destekli rapor özeti oluşturur.

## 🤖 AI Entegrasyonu

### OpenAI GPT-4 Kullanımı
- İçgörü üretimi
- Sentiment analizi
- Öneri oluşturma
- Rapor özetleme

### AI Servis Metodları
```typescript
// İçgörü üretimi
await aiService.generateInsights(healthScoreData);

// Sentiment analizi
await aiService.analyzeSentiment(messages);

// Öneri oluşturma
await aiService.generateRecommendations(healthScore, trends);

// Rapor özetleme
await aiService.generateReportSummary(reportData);
```

## 🔔 Bildirim Sistemi

### Push Notification Türleri
- Haftalık rapor bildirimi
- Yeni içgörü bildirimi
- Hedef hatırlatması
- Hedef başarı bildirimi
- Sağlık skoru güncelleme bildirimi

### Bildirim Servis Metodları
```typescript
// Haftalık rapor bildirimi
await notificationService.sendWeeklyReportNotification(userId, reportData);

// İçgörü bildirimi
await notificationService.sendInsightNotification(userId, insight);

// Hedef hatırlatması
await notificationService.sendGoalReminder(userId, goal);
```

## 📈 Analiz Algoritmaları

### Sağlık Skoru Hesaplama
1. **İletişim Skoru**: Mesaj sıklığı, sentiment, yanıt süresi
2. **Yakınlık Skoru**: Ortak aktiviteler, fotoğraf paylaşımı
3. **Güven Skoru**: Tutarlılık, güvenilirlik, şeffaflık
4. **Memnuniyet Skoru**: Ruh hali, geri bildirim
5. **Çatışma Çözümü**: Çatışma sıklığı, çözüm süresi

### Ağırlık Dağılımı
- İletişim: %25
- Yakınlık: %20
- Güven: %20
- Memnuniyet: %20
- Çatışma Çözümü: %15

## 🛠️ Kurulum ve Konfigürasyon

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
EXPO_ACCESS_TOKEN=your_expo_access_token
```

### Gerekli Bağımlılıklar
- OpenAI SDK
- Expo Server SDK
- Express Validator
- MongoDB/Mongoose

## 🧪 Test Örnekleri

### Health Score Hesaplama Testi
```typescript
const healthScore = await analyticsService.calculateHealthScore(userId, partnerId);
expect(healthScore.overall).toBeGreaterThanOrEqual(0);
expect(healthScore.overall).toBeLessThanOrEqual(100);
```

### AI İçgörü Üretimi Testi
```typescript
const insights = await aiService.generateInsights(healthScoreData);
expect(insights).toHaveLength(3);
expect(insights[0].type).toBe('warning');
```

## 📊 Performans Optimizasyonu

### Veritabanı İndeksleri
- HealthScore: userId, partnerId, calculatedAt
- Goal: userId, partnerId, status, category
- Insight: userId, partnerId, type, impact
- Report: userId, partnerId, type, generatedAt

### Caching Stratejisi
- Health score sonuçları 1 saat cache
- AI içgörüleri 24 saat cache
- Rapor verileri 1 hafta cache

## 🔒 Güvenlik

### Authentication
- Tüm endpoint'ler JWT token gerektirir
- Kullanıcı sadece kendi verilerine erişebilir

### Rate Limiting
- Analytics endpoint'leri: 100 istek/15 dakika
- AI endpoint'leri: 10 istek/dakika

### Veri Gizliliği
- Hassas veriler şifrelenir
- GDPR uyumlu veri işleme

## 🚀 Deployment

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4201
CMD ["npm", "start"]
```

### Health Checks
- `/health` endpoint'i sistem durumunu kontrol eder
- Veritabanı bağlantısı test edilir
- AI servis erişilebilirliği kontrol edilir

## 📚 Geliştirme Notları

### Yeni Özellik Ekleme
1. Model tanımla
2. Service metodları ekle
3. Controller oluştur
4. Route tanımla
5. Validator ekle
6. Test yaz

### Hata Yönetimi
- Tüm servisler try-catch kullanır
- Detaylı hata logları
- Kullanıcı dostu hata mesajları

### Logging
- Tüm API çağrıları loglanır
- AI servis kullanımı izlenir
- Performans metrikleri toplanır

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Test yazın
5. Pull request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

