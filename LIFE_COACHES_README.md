# Yaşam Koçları AI Sistemi

Bu sistem, kullanıcıların farklı uzmanlık alanlarında yapay zeka koçları ile sohbet edebilmelerini sağlar. Her koç kendi uzmanlık alanında özelleştirilmiş yanıtlar verir.

## Mevcut Koçlar

### 1. İlişki Koçu (`relationship_coach`)
- **Uzmanlık:** İlişki problemleri, iletişim, güven ve romantik bağlar
- **Yardım Edebileceği Konular:**
  - İlişki problemlerini çözme
  - Etkili iletişim teknikleri
  - Güven ve bağlanma sorunları
  - Çatışma çözümü
  - Romantik ilişkilerde büyüme

### 2. Kariyer Koçu (`career_coach`)
- **Uzmanlık:** Kariyer gelişimi, iş değişikliği, hedef belirleme
- **Yardım Edebileceği Konular:**
  - Kariyer planlama ve hedef belirleme
  - İş değişikliği ve geçiş süreçleri
  - CV ve mülakat hazırlığı
  - Networking ve kişisel marka
  - Liderlik ve yönetim becerileri

### 3. Sağlık Koçu (`health_coach`)
- **Uzmanlık:** Fiziksel sağlık, beslenme, egzersiz, yaşam tarzı
- **Yardım Edebileceği Konular:**
  - Beslenme ve diyet planlama
  - Egzersiz programları
  - Stres yönetimi
  - Uyku düzeni
  - Mental sağlık

### 4. Kişisel Gelişim Koçu (`personal_development_coach`)
- **Uzmanlık:** Kişisel gelişim, özgüven, hedef belirleme
- **Yardım Edebileceği Konular:**
  - Özgüven geliştirme
  - Kişisel hedef belirleme
  - Zaman yönetimi
  - Stres ve kaygı yönetimi
  - Yaşam amacı keşfi

### 5. Finansal Koç (`financial_coach`)
- **Uzmanlık:** Para yönetimi, bütçe planlama, yatırım
- **Yardım Edebileceği Konular:**
  - Bütçe planlama ve para yönetimi
  - Tasarruf stratejileri
  - Borç yönetimi
  - Yatırım planlama
  - Finansal hedef belirleme

## API Endpoints

### 1. Mevcut Koçları Listele
```http
GET /api/ai-chat/coaches
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "relationship_coach",
      "name": "İlişki Koçu",
      "description": "İlişki problemleri, iletişim, güven ve romantik bağlar konusunda uzman"
    },
    // ... diğer koçlar
  ]
}
```

### 2. Belirli Bir Koç ile Sohbet Oluştur
```http
POST /api/ai-chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "İlişki Problemlerim",
  "coachType": "relationship_coach",
  "coachId": "relationship_coach"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "title": "İlişki Koçu ile Sohbet",
    "coachType": "relationship_coach",
    "coachId": "relationship_coach",
    "messageCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Koç ile Mesaj Gönder
```http
POST /api/ai-chat/sessions/{sessionId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Partnerimle iletişim kurmakta zorlanıyorum"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "message": {
      "role": "assistant",
      "content": "İletişim sorunları ilişkilerde çok yaygın...",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "messageCount": 2,
    "coachType": "relationship_coach",
    "coachId": "relationship_coach"
  }
}
```

### 4. Tüm Sohbetleri Listele
```http
GET /api/ai-chat/sessions
Authorization: Bearer <token>
```

**Query Parameters:**
- `coachType`: Belirli koç türündeki sohbetleri filtrele
- `coachId`: Belirli koç ile olan sohbetleri filtrele

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "uuid",
      "title": "İlişki Koçu ile Sohbet",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "messageCount": 5,
      "lastMessage": {
        "role": "user",
        "content": "Teşekkürler",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      "coachType": "relationship_coach",
      "coachId": "relationship_coach"
    }
  ]
}
```

### 5. Belirli Bir Koç ile Olan Sohbetleri Listele
```http
GET /api/ai-chat/coaches/{coachId}/sessions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coach": {
      "id": "relationship_coach",
      "name": "İlişki Koçu",
      "description": "İlişki problemleri, iletişim, güven ve romantik bağlar konusunda uzman"
    },
    "sessions": [
      // ... sohbet listesi
    ]
  }
}
```

### 6. Sohbet Mesajlarını Getir
```http
GET /api/ai-chat/sessions/{sessionId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "title": "İlişki Koçu ile Sohbet",
    "messages": [
      {
        "role": "user",
        "content": "Merhaba",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Merhaba! Size nasıl yardımcı olabilirim?",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "coachType": "relationship_coach",
    "coachId": "relationship_coach"
  }
}
```

## Kullanım Senaryoları

### Senaryo 1: İlişki Problemi
1. Koçları listele
2. İlişki Koçu ile yeni sohbet oluştur
3. Problemi anlat
4. Koçtan öneriler al
5. Geçmiş sohbetleri görüntüle ve devam et

### Senaryo 2: Kariyer Değişikliği
1. Kariyer Koçu ile sohbet başlat
2. Mevcut durumu ve hedefleri paylaş
3. Stratejik plan al
4. İlerleme kaydet ve takip et

### Senaryo 3: Sağlık Hedefleri
1. Sağlık Koçu ile çalışmaya başla
2. Mevcut durumu değerlendir
3. Kişiselleştirilmiş plan al
4. Düzenli olarak güncelleme yap

## Özellikler

- **Kişiselleştirilmiş Yanıtlar:** Her koç kendi uzmanlık alanında özelleştirilmiş yanıtlar verir
- **Sohbet Geçmişi:** Tüm sohbetler kaydedilir ve devam edilebilir
- **Filtreleme:** Koç türüne göre sohbetleri filtreleyebilme
- **Sürekli Öğrenme:** Her sohbet önceki konuşmaları dikkate alır
- **Güvenli:** Kullanıcı kimlik doğrulaması ile güvenli erişim

## Teknik Detaylar

- **AI Model:** GPT-3.5-turbo
- **Veritabanı:** MongoDB (Mongoose)
- **Authentication:** JWT token
- **API:** RESTful endpoints
- **Dil:** Türkçe (koçlar Türkçe yanıt verir)

## Kurulum ve Çalıştırma

1. Bağımlılıkları yükle:
```bash
npm install
```

2. Veritabanı bağlantısını yapılandır

3. API key'leri ayarla:
   - OpenAI API key
   - Google Gemini API key (opsiyonel)

4. Uygulamayı başlat:
```bash
npm start
```

## Notlar

- Her koç kendi sistem promptu ile yapılandırılmıştır
- Sohbet geçmişi son 10 mesaj ile sınırlıdır (performans için)
- Koçlar Türkçe yanıt verir ve Türkçe kültürüne uygun öneriler sunar
- Sistem hem TypeScript hem JavaScript dosyalarını destekler
