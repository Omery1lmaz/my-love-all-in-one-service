# 📋 Subscription System - Complete Guide

## 🎯 Genel Bakış

Bu proje, kullanıcıların farklı planlara abone olarak çeşitli özelliklerden sınırlı veya sınırsız şekilde yararlanabildiği kapsamlı bir subscription (abonelik) sistemine sahiptir. Sistem, tüm servislerde entegre olarak çalışır ve kullanıcı deneyimini plan tipine göre özelleştirir.

## 🏗️ Sistem Mimarisi

### 📊 Plan Yapısı

| Plan | Fiyat | Storage | Fotoğraf | AI Mesaj/Ay | Koç Seansı/Ay | Album | Günlük | Etkinlik | Timeline |
|------|-------|---------|----------|-------------|---------------|-------|--------|----------|----------|
| **Free** | $0 | 100 MB | 50 | 20 | 5 | 5 | 30 | 10 | 20 |
| **Premium** | $9.99 | 5 GB | 1,000 | 200 | 50 | 50 | 365 | 100 | 100 |
| **Premium Plus** | $19.99 | 50 GB | 10,000 | 1,000 | 200 | 200 | 1,000 | 500 | 500 |

### 🔧 Teknik Yapı

```
src/
├── Models/
│   ├── subscription.ts          # Subscription modeli
│   ├── storageUsage.ts          # Storage kullanım takibi
│   └── aiChat.ts               # AI chat kullanım takibi
├── subscriptionControllers/     # Subscription işlemleri
├── subscriptionRoutes/          # Subscription endpoint'leri
└── services/
    └── storageService.ts        # Storage yönetimi
```

## 🚀 Nasıl Çalışır?

### 1. **Otomatik Subscription Oluşturma**

Her kullanıcı ilk kez sistemi kullandığında otomatik olarak **Free** plan ile subscription oluşturulur:

```typescript
// Her controller'da otomatik olarak çalışır
userSubscription = await Subscription.getDefaultSubscription(
  new mongoose.Types.ObjectId(decodedToken.id)
);
```

### 2. **Real-time Limit Kontrolü**

Her işlem öncesi kullanıcının limitlerini kontrol eder:

```typescript
// Fotoğraf yükleme örneği
const canUpload = await StorageService.canUploadPhoto(
  new mongoose.Types.ObjectId(decodedToken.id),
  file.size
);

if (!canUpload.canUpload) {
  return next(new BadRequestError(canUpload.reason));
}
```

### 3. **Plan Bazlı Limitler**

Her servis, kullanıcının plan tipine göre farklı limitler uygular:

```typescript
const maxAlbums = userSubscription.planType === 'free' ? 5 : 
                 userSubscription.planType === 'premium' ? 50 : 200;
```

## 📱 Entegre Servisler

### ✅ **Tam Entegre Olan Servisler**

#### 📸 **Photo Service**
- **Storage Kontrolü:** Dosya boyutu ve toplam storage limiti
- **Fotoğraf Sayısı:** Plan bazlı maksimum fotoğraf limiti
- **Real-time Takip:** Her yükleme sonrası kullanım güncellenir

#### 🤖 **AI Chat Service**
- **Aylık Mesaj Limiti:** Plan bazlı AI mesaj sayısı
- **Koç Seansı Limiti:** Yaşam koçları ile görüşme limiti
- **Session Takibi:** Aktif chat session'ları sayılır

#### 📁 **Album Service**
- **Album Sayısı:** Plan bazlı maksimum album limiti
- **Kullanım Bilgisi:** Mevcut ve kalan album sayısı

#### 📝 **Daily Journey Service**
- **Günlük Limiti:** Plan bazlı maksimum günlük sayısı
- **Aylık Takip:** Ay bazında günlük oluşturma limiti

#### 🎉 **Event Service**
- **Etkinlik Limiti:** Plan bazlı maksimum etkinlik sayısı
- **Kullanım Takibi:** Oluşturulan etkinlik sayısı

#### ⏰ **Timeline Service**
- **Timeline Limiti:** Plan bazlı maksimum timeline sayısı
- **Event Takibi:** Oluşturulan timeline event'leri

## 🔄 Kullanım Takibi

### **Storage Usage Model**
```typescript
interface StorageUsageAttrs {
  user: mongoose.Types.ObjectId;
  totalStorageUsed: number; // bytes
  photosCount: number;
  lastUpdated: Date;
}
```

### **AI Chat Usage**
```typescript
// Aylık mesaj sayısı hesaplama
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const aiChatSessions = await AIChatSession.find({
  userId: userId,
  isActive: true,
  updatedAt: { $gte: startOfMonth }
});
```

## 📊 API Endpoint'leri

### **Subscription Management**
- `GET /subscription/user` - Kullanıcı subscription bilgileri
- `POST /subscription/upgrade` - Plan yükseltme
- `POST /subscription/downgrade` - Plan düşürme
- `GET /subscription/history` - Abonelik geçmişi

### **Usage Information**
Her endpoint response'unda kullanım bilgileri döner:

```json
{
  "subscription": {
    "planType": "premium",
    "storageLimit": 5368709120,
    "maxPhotos": 1000
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
    }
  }
}
```

## 🛡️ Güvenlik ve Validasyon

### **Authentication**
- Tüm subscription işlemleri JWT token ile korunur
- Her request'te kullanıcı doğrulanır

### **Limit Enforcement**
- Real-time limit kontrolü
- Limit aşımında işlem engellenir
- Kullanıcıya açık hata mesajları

### **Data Integrity**
- Otomatik subscription oluşturma
- Tutarlı limit uygulaması
- Kullanım verilerinin doğruluğu

## 🔧 Geliştirici Rehberi

### **Yeni Servis Entegrasyonu**

1. **Subscription Kontrolü Ekle:**
```typescript
let userSubscription;
try {
  userSubscription = await Subscription.getDefaultSubscription(
    new mongoose.Types.ObjectId(decodedToken.id)
  );
} catch (error) {
  return next(new BadRequestError("Subscription doğrulanamadı"));
}
```

2. **Limit Kontrolü Ekle:**
```typescript
const maxItems = userSubscription.planType === 'free' ? 10 : 
                userSubscription.planType === 'premium' ? 100 : 500;

const existingItems = await YourModel.countDocuments({ user: decodedToken.id });

if (existingItems >= maxItems) {
  return next(new BadRequestError(`Limit aşıldı. Maksimum ${maxItems} item oluşturabilirsiniz.`));
}
```

3. **Response'a Kullanım Bilgisi Ekle:**
```typescript
res.status(201).json({
  message: "Item created successfully",
  data: newItem,
  subscriptionInfo: {
    planType: userSubscription.planType,
    remainingItems: maxItems - (existingItems + 1),
    maxItems: maxItems
  }
});
```

### **Storage Service Kullanımı**

```typescript
import { StorageService } from "../services/storageService";

// Upload öncesi kontrol
const canUpload = await StorageService.canUploadPhoto(
  new mongoose.Types.ObjectId(decodedToken.id),
  file.size
);

if (!canUpload.canUpload) {
  return next(new BadRequestError(canUpload.reason));
}

// Upload sonrası güncelleme
await StorageService.updateUserStorage(new mongoose.Types.ObjectId(decodedToken.id));
```

## 📈 Monitoring ve Analytics

### **Kullanım Metrikleri**
- Storage kullanımı (bytes)
- Fotoğraf sayısı
- AI mesaj sayısı (aylık)
- Koç seansı sayısı (aylık)
- Album/Event/Timeline sayıları

### **Plan Dağılımı**
- Free plan kullanıcıları
- Premium plan kullanıcıları
- Premium Plus plan kullanıcıları

### **Limit Aşım Oranları**
- Hangi limitlerin en çok aşıldığı
- Hangi planların yükseltme ihtiyacı olduğu

## 🚨 Hata Yönetimi

### **Yaygın Hatalar**

1. **Limit Aşımı:**
```json
{
  "message": "Album limit exceeded. You can create up to 5 albums with your current plan.",
  "error": "LIMIT_EXCEEDED",
  "currentUsage": 5,
  "limit": 5,
  "planType": "free"
}
```

2. **Storage Aşımı:**
```json
{
  "message": "Storage limit exceeded. Please upgrade your plan or delete some photos.",
  "error": "STORAGE_LIMIT_EXCEEDED",
  "usedStorage": "100MB",
  "limit": "100MB"
}
```

3. **Subscription Bulunamadı:**
```json
{
  "message": "Subscription doğrulanamadı",
  "error": "SUBSCRIPTION_NOT_FOUND"
}
```

## 🔄 Plan Yönetimi

### **Plan Yükseltme**
```typescript
// Premium plana yükseltme
await Subscription.upgradePlan(userId, 'premium');

// Yeni limitler otomatik uygulanır
// - Storage: 5GB
// - Fotoğraf: 1,000
// - AI Mesaj: 200/ay
```

### **Plan Düşürme**
```typescript
// Free plana düşürme
await Subscription.downgradeToFree(userId);

// Limitler free plan seviyesine düşer
// Kullanım limitleri aşılıyorsa uyarı verilir
```

## 📱 Frontend Entegrasyonu

### **Kullanım Bilgilerini Gösterme**
```javascript
// Subscription bilgilerini al
const response = await fetch('/subscription/user', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const data = await response.json();

// Progress bar'lar için
const storagePercentage = data.usage.storage.usedPercentage;
const photosPercentage = data.usage.photos.usedPercentage;
const aiMessagesPercentage = data.usage.aiChat.monthlyMessages.usedPercentage;
```

### **Limit Uyarıları**
```javascript
// Limit %80'e ulaştığında uyarı
if (storagePercentage >= 80) {
  showWarning('Storage limitiniz dolmak üzere!');
}

// Limit %100'e ulaştığında upgrade öner
if (storagePercentage >= 100) {
  showUpgradeModal('Storage limitiniz doldu. Premium plana geçin!');
}
```

## 🎯 Sonuç

Bu subscription sistemi:

✅ **Tam Entegre:** Tüm servislerde çalışır
✅ **Real-time:** Anlık limit kontrolü
✅ **Esnek:** Kolayca yeni limitler eklenebilir
✅ **Güvenli:** JWT tabanlı authentication
✅ **Kullanıcı Dostu:** Açık hata mesajları
✅ **Ölçeklenebilir:** Yeni planlar kolayca eklenebilir

Sistem, kullanıcıların planlarına göre özelliklerden yararlanmasını sağlar ve premium özellikler için plan yükseltme teşvik eder. 🚀
