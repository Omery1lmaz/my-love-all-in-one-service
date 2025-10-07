# Get User Subscription API

## 📋 Genel Bakış

Bu endpoint, kullanıcının mevcut abonelik bilgilerini ve kullanım detaylarını getirir. Kullanıcının storage, fotoğraf ve AI chat kullanım limitlerini, kalan haklarını ve kullanım yüzdelerini detaylı olarak gösterir.

## 🔗 Endpoint Bilgileri

- **URL:** `GET /subscription/user`
- **Method:** `GET`
- **Authentication:** Bearer Token (JWT) gerekli
- **Content-Type:** `application/json`

## 🔐 Authentication

Bu endpoint için geçerli bir JWT token gereklidir. Token, `Authorization` header'ında `Bearer` formatında gönderilmelidir.

```http
Authorization: Bearer <your-jwt-token>
```

## 📥 Request

### Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body
Bu endpoint için request body gerekmez.

## 📤 Response

### ✅ Başarılı Response (200 OK)

```json
{
  "message": "Subscription retrieved successfully",
  "subscription": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "planType": "premium",
    "storageLimit": 5368709120,
    "maxPhotos": 1000,
    "isActive": true,
    "startDate": "2024-01-15T10:30:00.000Z",
    "endDate": "2024-02-15T10:30:00.000Z",
    "autoRenew": true,
    "price": 9.99,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "lastPaymentDate": "2024-01-15T10:30:00.000Z",
    "nextPaymentDate": "2024-02-15T10:30:00.000Z",
    "isExpired": false,
    "daysUntilExpiry": 25,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  },
  "usage": {
    "storage": {
      "used": 1073741824,
      "limit": 5368709120,
      "remaining": 4294967296,
      "usedPercentage": 20
    },
    "photos": {
      "used": 150,
      "limit": 1000,
      "remaining": 850,
      "usedPercentage": 15
    },
    "aiChat": {
      "monthlyMessages": {
        "used": 45,
        "limit": 200,
        "remaining": 155,
        "usedPercentage": 23
      },
      "coachSessions": {
        "used": 8,
        "limit": 50,
        "remaining": 42
      }
    }
  }
}
```

### 🆕 Default Subscription Oluşturulduğunda (200 OK)

Eğer kullanıcının subscription'ı yoksa, otomatik olarak free plan oluşturulur:

```json
{
  "message": "Default subscription created",
  "subscription": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "planType": "free",
    "storageLimit": 104857600,
    "maxPhotos": 50,
    "isActive": true,
    "startDate": "2024-01-20T14:45:00.000Z",
    "endDate": null,
    "autoRenew": false,
    "price": 0,
    "currency": "USD",
    "isExpired": false,
    "daysUntilExpiry": Infinity,
    "createdAt": "2024-01-20T14:45:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  },
  "usage": {
    "storage": {
      "used": 0,
      "limit": 104857600,
      "remaining": 104857600,
      "usedPercentage": 0
    },
    "photos": {
      "used": 0,
      "limit": 50,
      "remaining": 50,
      "usedPercentage": 0
    },
    "aiChat": {
      "monthlyMessages": {
        "used": 0,
        "limit": 20,
        "remaining": 20,
        "usedPercentage": 0
      },
      "coachSessions": {
        "used": 0,
        "limit": 5,
        "remaining": 5
      }
    }
  }
}
```

## 📊 Plan Limitleri

| Plan | Storage | Fotoğraf | AI Mesaj/Ay | Koç Seansı/Ay | Fiyat |
|------|---------|----------|-------------|---------------|-------|
| **Free** | 100 MB | 50 | 20 | 5 | $0 |
| **Premium** | 5 GB | 1,000 | 200 | 50 | $9.99 |
| **Premium Plus** | 50 GB | 10,000 | 1,000 | 200 | $19.99 |

## 🔍 Response Field Açıklamaları

### Subscription Object
- **id:** Subscription'ın benzersiz ID'si
- **planType:** Abonelik planı (`free`, `premium`, `premium_plus`)
- **storageLimit:** Toplam depolama limiti (bytes)
- **maxPhotos:** Maksimum fotoğraf sayısı
- **isActive:** Abonelik aktif mi?
- **startDate:** Abonelik başlangıç tarihi
- **endDate:** Abonelik bitiş tarihi (free plan için null)
- **autoRenew:** Otomatik yenileme aktif mi?
- **price:** Aylık ücret
- **currency:** Para birimi
- **paymentMethod:** Ödeme yöntemi
- **lastPaymentDate:** Son ödeme tarihi
- **nextPaymentDate:** Sonraki ödeme tarihi
- **isExpired:** Abonelik süresi dolmuş mu?
- **daysUntilExpiry:** Kalan gün sayısı (Infinity = süresiz)

### Usage Object
- **storage.used:** Kullanılan depolama alanı (bytes)
- **storage.limit:** Toplam depolama limiti (bytes)
- **storage.remaining:** Kalan depolama alanı (bytes)
- **storage.usedPercentage:** Kullanım yüzdesi (0-100)

- **photos.used:** Yüklenen fotoğraf sayısı
- **photos.limit:** Maksimum fotoğraf sayısı
- **photos.remaining:** Kalan fotoğraf hakkı
- **photos.usedPercentage:** Kullanım yüzdesi (0-100)

- **aiChat.monthlyMessages.used:** Bu ay gönderilen AI mesaj sayısı
- **aiChat.monthlyMessages.limit:** Aylık AI mesaj limiti
- **aiChat.monthlyMessages.remaining:** Kalan AI mesaj hakkı
- **aiChat.monthlyMessages.usedPercentage:** Kullanım yüzdesi (0-100)

- **aiChat.coachSessions.used:** Bu ay yapılan koç seansı sayısı
- **aiChat.coachSessions.limit:** Aylık koç seansı limiti
- **aiChat.coachSessions.remaining:** Kalan koç seansı hakkı

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "message": "Not authorized"
}
```

### 400 Bad Request
```json
{
  "message": "User ID not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to get subscription"
}
```

## 🧪 Test Örnekleri

### cURL
```bash
curl -X GET \
  'http://localhost:3000/subscription/user' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

### JavaScript (Fetch)
```javascript
const response = await fetch('/subscription/user', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### JavaScript (Axios)
```javascript
const response = await axios.get('/subscription/user', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

console.log(response.data);
```

## 📝 Notlar

1. **AI Chat Kullanımı:** Aylık mesaj sayısı, ayın başından itibaren hesaplanır
2. **Storage Hesaplama:** Sadece aktif (silinmemiş) fotoğraflar hesaplanır
3. **Koç Seansları:** `general` tipindeki AI chat'ler koç seansı olarak sayılmaz
4. **Default Subscription:** Kullanıcının subscription'ı yoksa otomatik olarak free plan oluşturulur
5. **Real-time Data:** Kullanım verileri gerçek zamanlı olarak hesaplanır

## 🔄 İlgili Endpoint'ler

- `POST /subscription/upgrade` - Plan yükseltme
- `POST /subscription/downgrade` - Plan düşürme
- `GET /subscription/history` - Abonelik geçmişi
- `GET /photo/storage-info` - Detaylı storage bilgileri

## 🐛 Troubleshooting

### Yaygın Hatalar

1. **401 Unauthorized:** Token geçersiz veya eksik
2. **500 Internal Server Error:** Veritabanı bağlantı sorunu
3. **Kullanım verileri güncel değil:** Storage usage tablosu güncellenmemiş olabilir

### Debug İpuçları

- Token'ın geçerli olduğundan emin olun
- Kullanıcının veritabanında mevcut olduğunu kontrol edin
- Storage usage verilerinin güncel olduğunu doğrulayın
