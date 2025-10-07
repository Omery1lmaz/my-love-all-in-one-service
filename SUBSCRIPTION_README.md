# 📋 Subscription System Documentation

## 🎯 Genel Bakış

Bu proje, kullanıcıların farklı planlara sahip olabileceği ve bu planlara göre limitlerin uygulandığı kapsamlı bir subscription sistemi içerir. Sistem, kullanıcıların fotoğraf yükleme, album oluşturma, günlük yazma, etkinlik oluşturma, timeline oluşturma, mesajlaşma ve AI sohbet gibi özelliklerini plan bazında sınırlar.

## 📊 Subscription Planları

### 🆓 **FREE PLAN**
- **Fiyat**: $0/ay
- **Depolama Limiti**: 100 MB
- **Maksimum Fotoğraf**: 50 adet
- **Maksimum Album**: 5 adet
- **Maksimum Günlük**: 30 adet
- **Maksimum Etkinlik**: 10 adet
- **Maksimum Timeline**: 20 adet
- **Maksimum Mesaj**: 100 adet
- **Maksimum AI Mesajı**: 20 adet
- **Maksimum AI Session**: 3 adet

### 💎 **PREMIUM PLAN**
- **Fiyat**: $9.99/ay
- **Depolama Limiti**: 5 GB
- **Maksimum Fotoğraf**: 1,000 adet
- **Maksimum Album**: 50 adet
- **Maksimum Günlük**: 365 adet
- **Maksimum Etkinlik**: 100 adet
- **Maksimum Timeline**: 100 adet
- **Maksimum Mesaj**: 1,000 adet
- **Maksimum AI Mesajı**: 100 adet
- **Maksimum AI Session**: 10 adet

### 👑 **PREMIUM PLUS PLAN**
- **Fiyat**: $19.99/ay
- **Depolama Limiti**: 50 GB
- **Maksimum Fotoğraf**: 10,000 adet
- **Maksimum Album**: 200 adet
- **Maksimum Günlük**: 1,000 adet
- **Maksimum Etkinlik**: 500 adet
- **Maksimum Timeline**: 500 adet
- **Maksimum Mesaj**: 10,000 adet
- **Maksimum AI Mesajı**: 500 adet
- **Maksimum AI Session**: 50 adet

## 🏗️ Sistem Mimarisi

### 📁 **Model Yapısı**

#### **Subscription Model**
```typescript
interface SubscriptionDoc {
  user: mongoose.Types.ObjectId;
  planType: "free" | "premium" | "premium_plus";
  storageLimit: number;
  maxPhotos: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
  price?: number;
  currency?: string;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
}
```

#### **StorageUsage Model**
```typescript
interface StorageUsageDoc {
  user: mongoose.Types.ObjectId;
  totalStorageUsed: number;
  photosCount: number;
  lastUpdated: Date;
}
```

### 🔧 **Temel Metodlar**

#### **Subscription Model Metodları**
- `getDefaultSubscription(userId)`: Kullanıcı için varsayılan subscription oluşturur
- `getActiveSubscription(userId)`: Aktif subscription'ı getirir
- `upgradePlan(userId, newPlanType)`: Plan yükseltme
- `downgradeToFree(userId)`: Free plan'a düşürme
- `isExpired()`: Subscription'ın süresi dolmuş mu kontrol eder
- `daysUntilExpiry()`: Kalan gün sayısını hesaplar

#### **StorageService Metodları**
- `updateUserStorage(userId)`: Kullanıcının depolama kullanımını günceller
- `canUploadPhoto(userId, fileSize)`: Fotoğraf yükleme izni kontrol eder
- `getUserStorageInfo(userId)`: Kullanıcının depolama bilgilerini getirir

## 🚀 API Endpoints

### 📋 **Subscription Management**

#### **GET** `/subscription/user`
Kullanıcının mevcut subscription bilgilerini getirir.

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "subscription_id",
    "planType": "premium",
    "storageLimit": 5368709120,
    "maxPhotos": 1000,
    "isActive": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "autoRenew": true,
    "price": 9.99,
    "currency": "USD",
    "isExpired": false,
    "daysUntilExpiry": 15
  }
}
```

#### **PUT** `/subscription/update`
Kullanıcının subscription bilgilerini günceller.

**Request Body:**
```json
{
  "planType": "premium_plus",
  "autoRenew": true,
  "paymentMethod": "credit_card",
  "price": 19.99,
  "currency": "USD"
}
```

#### **GET** `/subscription/plans`
Mevcut subscription planlarını listeler.

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "planType": "free",
      "name": "Free Plan",
      "price": 0,
      "currency": "USD",
      "features": {
        "storageLimit": 104857600,
        "maxPhotos": 50,
        "maxAlbums": 5,
        "maxJournals": 30,
        "maxEvents": 10,
        "maxTimelines": 20,
        "maxMessages": 100,
        "maxAIMessages": 20,
        "maxAISessions": 3
      }
    }
  ]
}
```

#### **POST** `/subscription/cancel`
Kullanıcının subscription'ını iptal eder (free plan'a düşürür).

#### **GET** `/subscription/history`
Kullanıcının subscription geçmişini getirir.

### 📊 **Storage Management**

#### **GET** `/storage/info`
Kullanıcının depolama kullanım bilgilerini getirir.

**Response:**
```json
{
  "success": true,
  "storageInfo": {
    "totalStorageUsed": 52428800,
    "photosCount": 25,
    "storageLimit": 104857600,
    "usagePercentage": 50,
    "remainingStorage": 52428800,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔒 Güvenlik ve Doğrulama

### 🛡️ **Authentication**
- Tüm subscription endpoint'leri JWT token ile korunur
- `requireAuth` middleware kullanılır
- Token doğrulama her istekte yapılır

### ✅ **Input Validation**
- Express-validator kullanılarak input doğrulama
- Plan tipi enum kontrolü
- Tarih formatı doğrulama
- Sayısal değer doğrulama

### 🔐 **Authorization**
- Kullanıcılar sadece kendi subscription bilgilerine erişebilir
- Partner bilgileri paylaşımı sınırlı
- Admin yetkisi gerektiren işlemler ayrı kontrol edilir

## 📈 Limit Kontrolü

### 🎯 **Otomatik Limit Kontrolü**
Her controller'da aşağıdaki kontroller yapılır:

1. **Subscription Doğrulama**: Kullanıcının aktif subscription'ı var mı?
2. **Limit Kontrolü**: Mevcut kullanım limiti aştı mı?
3. **Plan Bazlı İzin**: Plan tipine göre işlem yapılabilir mi?

### 📊 **Limit Kontrolü Örneği**
```typescript
// Album oluşturma örneği
const existingAlbums = await Album.countDocuments({ user: userId });
const maxAlbums = userSubscription.planType === 'free' ? 5 : 
                 userSubscription.planType === 'premium' ? 50 : 200;

if (existingAlbums >= maxAlbums) {
  return next(new BadRequestError(`Album limit exceeded. You can create up to ${maxAlbums} albums with your current plan.`));
}
```

## 🚨 Hata Kodları

### 📋 **Subscription Hataları**
- `SUBSCRIPTION_NOT_FOUND`: Subscription bulunamadı
- `SUBSCRIPTION_EXPIRED`: Subscription süresi dolmuş
- `SUBSCRIPTION_INACTIVE`: Subscription aktif değil
- `PLAN_LIMIT_EXCEEDED`: Plan limiti aşıldı
- `INVALID_PLAN_TYPE`: Geçersiz plan tipi
- `PAYMENT_FAILED`: Ödeme başarısız
- `AUTO_RENEWAL_FAILED`: Otomatik yenileme başarısız

### 🔧 **Hata Yönetimi**
```typescript
try {
  // Subscription işlemi
} catch (error) {
  console.error(`Subscription error for user ${userId}:`, error);
  return next(new BadRequestError("Subscription işlemi başarısız"));
}
```

## 📝 Loglama

### 🔍 **Detaylı Loglama**
Sistem, tüm subscription işlemlerini detaylı olarak loglar:

```typescript
console.log(`Subscription verified for user: ${userId}`, {
  subscriptionId: subscription._id,
  planType: subscription.planType,
  isActive: subscription.isActive,
  storageLimit: subscription.storageLimit,
  maxPhotos: subscription.maxPhotos
});
```

### 📊 **Log Seviyeleri**
- **INFO**: Normal işlemler
- **WARN**: Uyarı durumları
- **ERROR**: Hata durumları
- **DEBUG**: Debug bilgileri

## 🚀 Gelecek Özellikler

### 🔮 **Planlanan Özellikler**
- [ ] **Aile Planları**: Birden fazla kullanıcı için paylaşımlı planlar
- [ ] **Kurumsal Planlar**: Şirketler için özel planlar
- [ ] **Özel Limitler**: Kullanıcı bazında özel limit tanımlama
- [ ] **Promosyon Kodları**: İndirim ve promosyon sistemi
- [ ] **Ödeme Geçmişi**: Detaylı ödeme ve faturalandırma
- [ ] **Otomatik Yedekleme**: Premium planlar için otomatik yedekleme
- [ ] **Öncelikli Destek**: Premium kullanıcılar için öncelikli müşteri hizmetleri
- [ ] **API Rate Limiting**: Plan bazında API kullanım limitleri
- [ ] **Analytics Dashboard**: Kullanım istatistikleri ve analizler
- [ ] **Webhook Desteği**: Ödeme ve subscription değişiklikleri için webhook'lar

### 🔧 **Teknik İyileştirmeler**
- [ ] **Caching**: Redis ile subscription bilgilerini cache'leme
- [ ] **Queue System**: Büyük işlemler için queue sistemi
- [ ] **Monitoring**: Subscription sistem performans izleme
- [ ] **Testing**: Kapsamlı unit ve integration testleri
- [ ] **Documentation**: API dokümantasyonu ve örnekler

## 📞 Destek

### 🆘 **Yardım ve Destek**
- **Email**: support@myloveapp.com
- **Dokümantasyon**: [API Docs](https://docs.myloveapp.com)
- **GitHub Issues**: [GitHub Repository](https://github.com/myloveapp/subscription-system)

### 📚 **Ek Kaynaklar**
- [Subscription Best Practices](https://docs.myloveapp.com/best-practices)
- [API Examples](https://docs.myloveapp.com/examples)
- [Troubleshooting Guide](https://docs.myloveapp.com/troubleshooting)

---

**Son Güncelleme**: 2024-01-15  
**Versiyon**: 1.0.0  
**Geliştirici**: My Love App Team