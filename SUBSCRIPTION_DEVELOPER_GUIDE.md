# 🛠️ Subscription System Developer Guide

Bu dokümantasyon, Subscription sisteminin teknik detaylarını ve geliştiriciler için önemli bilgileri içerir.

## 📁 Proje Yapısı

```
src/
├── subscriptionControllers/          # Controller katmanı
│   ├── getUserSubscription.ts       # Kullanıcı subscription getir
│   ├── updateSubscription.ts        # Subscription güncelle
│   ├── getAvailablePlans.ts         # Mevcut planları listele
│   ├── cancelSubscription.ts        # Subscription iptal et
│   └── getSubscriptionHistory.ts    # Subscription geçmişi
├── subscriptionRoutes/              # Route katmanı
│   ├── index.ts                     # Ana route dosyası
│   ├── getUserSubscription.ts       # GET /subscription
│   ├── updateSubscription.ts        # PUT /subscription
│   ├── getAvailablePlans.ts         # GET /subscription/plans
│   ├── cancelSubscription.ts        # DELETE /subscription
│   └── getSubscriptionHistory.ts    # GET /subscription/history
├── subscriptionExpressValidators/   # Validation katmanı
│   └── updateSubscription.ts        # Update validation rules
├── Models/
│   ├── subscription.ts              # Subscription model
│   └── storageUsage.ts              # Storage usage model
└── services/
    └── storageService.ts            # Storage management service
```

## 🏗️ Mimari

### 1. Katmanlı Mimari

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Routes + Validators)       │
├─────────────────────────────────────┤
│           Business Layer            │
│            (Controllers)            │
├─────────────────────────────────────┤
│            Data Layer               │
│         (Models + Services)         │
├─────────────────────────────────────┤
│          Database Layer             │
│           (MongoDB)                 │
└─────────────────────────────────────┘
```

### 2. Veri Akışı

```
Request → Route → Validator → Controller → Service → Model → Database
   ↓
Response ← Route ← Controller ← Service ← Model ← Database
```

## 🗄️ Veritabanı Şeması

### Subscription Model

```typescript
interface SubscriptionDoc {
  _id: ObjectId;
  user: ObjectId;                    // User referansı
  planType: "free" | "premium" | "premium_plus";
  storageLimit: number;              // Byte cinsinden
  maxPhotos: number;                 // Maksimum fotoğraf sayısı
  startDate: Date;                   // Başlangıç tarihi
  endDate?: Date;                    // Bitiş tarihi (free plan'da null)
  isActive: boolean;                 // Aktif durumu
  autoRenew: boolean;                // Otomatik yenileme
  price: number;                     // Fiyat
  currency: string;                  // Para birimi
  paymentMethod?: string;            // Ödeme yöntemi
  lastPaymentDate?: Date;            // Son ödeme tarihi
  nextPaymentDate?: Date;            // Sonraki ödeme tarihi
  createdAt: Date;                   // Oluşturulma tarihi
  updatedAt: Date;                   // Güncellenme tarihi
}
```

### StorageUsage Model

```typescript
interface StorageUsageDoc {
  _id: ObjectId;
  user: ObjectId;                    // User referansı
  totalStorageUsed: number;          // Toplam kullanılan storage (bytes)
  photosCount: number;               // Toplam fotoğraf sayısı
  lastUpdated: Date;                 // Son güncelleme tarihi
  createdAt: Date;                   // Oluşturulma tarihi
  updatedAt: Date;                   // Güncellenme tarihi
}
```

## 🔧 Model Methods

### Subscription Model Methods

```typescript
// Instance Methods
subscription.isExpired(): boolean
subscription.daysUntilExpiry(): number

// Static Methods
Subscription.getDefaultSubscription(userId: ObjectId): Promise<SubscriptionDoc>
Subscription.getActiveSubscription(userId: ObjectId): Promise<SubscriptionDoc | null>
Subscription.upgradePlan(userId: ObjectId, newPlanType: string): Promise<SubscriptionDoc>
Subscription.downgradeToFree(userId: ObjectId): Promise<SubscriptionDoc>
```

### StorageUsage Model Methods

```typescript
// Static Methods
StorageUsage.updateUserStorage(userId: ObjectId): Promise<StorageUsageDoc>
```

## 🚀 Service Layer

### StorageService

```typescript
class StorageService {
  // Kullanıcının storage kullanımını güncelle
  static async updateUserStorage(userId: ObjectId): Promise<void>
  
  // Fotoğraf upload izni kontrolü
  static async canUploadPhoto(userId: ObjectId, fileSize: number): Promise<{
    canUpload: boolean;
    reason?: string;
    storageInfo?: any;
  }>
  
  // Kullanıcının storage bilgilerini getir
  static async getUserStorageInfo(userId: ObjectId): Promise<{
    storageUsage: any;
    subscription: any;
    storagePercentage: number;
    photosPercentage: number;
  }>
  
  // Bytes'ı human readable format'a çevir
  static formatBytes(bytes: number): string
  
  // Plan detaylarını getir
  static getStoragePlanDetails(planType: string): any
}
```

## 🔐 Güvenlik

### 1. Authentication

```typescript
// JWT Token doğrulama
const authHeader = req.headers.authorization;
if (!authHeader) {
  return next(new NotAuthorizedError());
}

const token = authHeader.split(" ")[1];
const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
  id: string;
  title: string;
};
```

### 2. Authorization

```typescript
// requireAuth middleware kullanımı
router.get("/", requireAuth, getUserSubscription);
router.put("/", requireAuth, updateSubscriptionValidator, validateRequest, updateSubscription);
```

### 3. Input Validation

```typescript
// Express-validator kullanımı
export const updateSubscriptionValidator = [
  body("planType")
    .optional()
    .isIn(["free", "premium", "premium_plus"])
    .withMessage("Plan type must be one of: free, premium, premium_plus"),
  
  body("autoRenew")
    .optional()
    .isBoolean()
    .withMessage("Auto renew must be a boolean value"),
  
  // ... diğer validasyonlar
];
```

## 📊 Logging Strategy

### 1. Structured Logging

```typescript
// Başarılı işlemler
console.log(`Subscription updated successfully for user: ${decodedToken.id}`, {
  subscriptionId: subscription._id,
  planType: subscription.planType,
  isActive: subscription.isActive
});

// Hata durumları
console.error("Error updating subscription:", {
  error: error?.message || 'Unknown error',
  stack: error?.stack,
  userId: decodedToken?.id || 'unknown',
  timestamp: new Date().toISOString()
});
```

### 2. Log Levels

- **INFO**: Normal işlemler
- **WARN**: Dikkat gerektiren durumlar
- **ERROR**: Hata durumları
- **DEBUG**: Geliştirme aşamasında detaylı bilgi

## 🧪 Testing

### 1. Unit Tests

```typescript
// Controller test örneği
describe('updateSubscription', () => {
  it('should update subscription successfully', async () => {
    const mockReq = {
      headers: { authorization: 'Bearer valid-token' },
      body: { planType: 'premium' }
    };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockNext = jest.fn();

    await updateSubscription(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Subscription updated successfully'
      })
    );
  });
});
```

### 2. Integration Tests

```typescript
// API endpoint test örneği
describe('PUT /subscription', () => {
  it('should update subscription with valid data', async () => {
    const response = await request(app)
      .put('/subscription')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        planType: 'premium',
        autoRenew: true
      })
      .expect(200);

    expect(response.body.subscription.planType).toBe('premium');
    expect(response.body.subscription.autoRenew).toBe(true);
  });
});
```

## 🔄 Error Handling

### 1. Error Types

```typescript
// Custom error classes
class SubscriptionNotFoundError extends Error {
  constructor(userId: string) {
    super(`Subscription not found for user: ${userId}`);
    this.name = 'SubscriptionNotFoundError';
  }
}

class PlanUpgradeError extends Error {
  constructor(currentPlan: string, targetPlan: string) {
    super(`Cannot upgrade from ${currentPlan} to ${targetPlan}`);
    this.name = 'PlanUpgradeError';
  }
}
```

### 2. Error Middleware

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err instanceof SubscriptionNotFoundError) {
    return res.status(404).json({
      message: err.message,
      code: 'SUBSCRIPTION_NOT_FOUND'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});
```

## 📈 Performance Optimization

### 1. Database Indexing

```typescript
// Subscription model'de indexler
subscriptionSchema.index({ user: 1 }); // Unique index
subscriptionSchema.index({ planType: 1 });
subscriptionSchema.index({ isActive: 1 });
subscriptionSchema.index({ endDate: 1 });
```

### 2. Caching Strategy

```typescript
// Redis cache örneği
const getCachedSubscription = async (userId: string) => {
  const cacheKey = `subscription:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const subscription = await Subscription.findOne({ user: userId });
  await redis.setex(cacheKey, 300, JSON.stringify(subscription)); // 5 dakika cache
  
  return subscription;
};
```

### 3. Database Queries Optimization

```typescript
// Efficient query örneği
const getActiveSubscriptions = async () => {
  return await Subscription.find({
    isActive: true,
    endDate: { $gt: new Date() }
  }).select('user planType storageLimit maxPhotos');
};
```

## 🔧 Configuration

### 1. Environment Variables

```bash
# .env
SECRET_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/subscription-db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
LOG_LEVEL=info
```

### 2. Plan Configuration

```typescript
// config/plans.ts
export const PLAN_CONFIG = {
  free: {
    storageLimit: 1024 * 1024 * 100, // 100MB
    maxPhotos: 50,
    price: 0,
    features: ['basic_storage', 'standard_support']
  },
  premium: {
    storageLimit: 1024 * 1024 * 1024 * 5, // 5GB
    maxPhotos: 1000,
    price: 9.99,
    features: ['advanced_storage', 'priority_support', 'high_quality_thumbnails']
  },
  premium_plus: {
    storageLimit: 1024 * 1024 * 1024 * 50, // 50GB
    maxPhotos: 10000,
    price: 19.99,
    features: ['unlimited_storage', 'priority_support', 'api_access', 'analytics']
  }
};
```

## 🚀 Deployment

### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/subscription-db
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

## 📊 Monitoring

### 1. Health Checks

```typescript
// health.ts
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Database connection check
    await mongoose.connection.db.admin().ping();
    
    // Redis connection check
    await redis.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};
```

### 2. Metrics Collection

```typescript
// metrics.ts
import { register, Counter, Histogram } from 'prom-client';

const subscriptionUpdates = new Counter({
  name: 'subscription_updates_total',
  help: 'Total number of subscription updates',
  labelNames: ['plan_type', 'status']
});

const subscriptionUpdateDuration = new Histogram({
  name: 'subscription_update_duration_seconds',
  help: 'Duration of subscription update operations',
  labelNames: ['plan_type']
});

// Kullanım
subscriptionUpdates.inc({ plan_type: 'premium', status: 'success' });
```

## 🔄 Migration Scripts

### 1. Database Migration

```typescript
// migrations/add_subscription_indexes.ts
export const up = async () => {
  await mongoose.connection.db.collection('subscriptions').createIndex(
    { user: 1 },
    { unique: true }
  );
  
  await mongoose.connection.db.collection('subscriptions').createIndex(
    { planType: 1, isActive: 1 }
  );
};

export const down = async () => {
  await mongoose.connection.db.collection('subscriptions').dropIndex('user_1');
  await mongoose.connection.db.collection('subscriptions').dropIndex('planType_1_isActive_1');
};
```

## 📚 Best Practices

### 1. Code Organization

- **Single Responsibility**: Her controller tek bir işlemi yapar
- **Dependency Injection**: Service'ler inject edilir
- **Error Boundaries**: Hatalar uygun seviyede yakalanır
- **Type Safety**: TypeScript strict mode kullanılır

### 2. Security

- **Input Validation**: Tüm input'lar validate edilir
- **SQL Injection**: NoSQL injection koruması
- **Rate Limiting**: API rate limiting uygulanır
- **CORS**: Cross-origin istekler kontrol edilir

### 3. Performance

- **Database Indexing**: Sık kullanılan query'ler için index
- **Caching**: Redis ile cache stratejisi
- **Connection Pooling**: Database connection pooling
- **Lazy Loading**: Gerektiğinde veri yükleme

---

**Son Güncelleme**: 2024-01-15  
**Versiyon**: 1.0.0  
**Geliştirici**: Heaven Nsoft Team
