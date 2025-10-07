# 🩷 LoveSync Gamification System — "Love Journey Levels"

## 🎯 Amaç
Kullanıcıların uygulamayı düzenli kullanmasını, partneriyle etkileşimini sürdürmesini ve duygusal gelişim süreçlerini takip etmesini teşvik etmek.

## 🪞 1. Seviye Sistemi (Rank Titles)

Her kullanıcı profiline bağlı olacak. İlişki içindeki etkileşim (not yazma, albüm oluşturma, müzik paylaşma, etkinlik ekleme, vs.) puan kazandırır.

| Seviye | İsim | Açıklama | Gereken Puan | Görsel Stil |
|--------|------|----------|--------------|-------------|
| 1️⃣ | "New Flame" | Aşk yolculuğuna yeni başlayan kullanıcı | 0 – 99 | Parlayan kalp emojisi 💖 |
| 2️⃣ | "Warm Connection" | Partneriyle ilk anılarını paylaşmaya başlayan | 100 – 299 | Sıcak tonlu halka animasyonu 🔅 |
| 3️⃣ | "True Listener" | Partnerinin duygularını anlamaya başlayan | 300 – 599 | Gradient mavi & pembe dalgalar 💫 |
| 4️⃣ | "Emotional Bond" | Düzenli notlar, paylaşımlar ve aktiviteler yapan | 600 – 999 | Parlayan zincir animasyonu 🔗 |
| 5️⃣ | "Soulmate Sync" | Uygulamanın tüm özelliklerini aktif kullanan, tam senkron partner | 1000+ | Işıltılı aurora efekti 🌌 |

## 💎 2. Puan Sistemi (LovePoints)

Kullanıcının yaptığı her aksiyona göre puan verir.

| Aksiyon | Puan |
|---------|------|
| Günlük not ekleme | +10 |
| Partnerle fotoğraf yükleme | +15 |
| Playlist oluşturma | +20 |
| Partnerle ortak etkinlik oluşturma | +25 |
| Partnerin notuna yorum / emoji bırakma | +5 |
| Partnerle 7 gün aralıksız etkileşim | +50 bonus |
| Uygulama içi "Challenge" tamamlama | +30 |
| İlk birlikte fotoğraf | +40 |
| Yıldönümü hatırlatması | +35 |
| Ruh hali paylaşımı | +8 |

## 🧠 3. Rozet Sistemi (Achievements)

| Rozet Adı | Açıklama | Ne Zaman Alınır |
|-----------|----------|-----------------|
| 💌 Memory Keeper | 10 fotoğraf yüklediğinde | 10 fotoğraf sonrası |
| 🎶 Sound of Love | 5 playlist oluşturduğunda | 5 playlist |
| 🕊️ Harmony Seeker | Partnerle 3 ortak not paylaştığında | 3 ortak not |
| 🌙 Night Writer | Gece 00:00-04:00 arasında 3 kez not yazdığında | 3 gece notu |
| 🔥 Love Streak | 10 gün aralıksız giriş yaptığında | 10 günlük streak |
| 💞 Eternal Flame | 1000 toplam puana ulaştığında | 1000+ puan |
| 📸 First Photo Together | İlk birlikte fotoğrafını yüklediğinde | İlk birlikte fotoğraf |
| 🎂 Anniversary Master | 5 yıldönümü hatırlatması oluşturduğunda | 5 yıldönümü hatırlatması |
| 😊 Mood Tracker | 30 gün boyunca ruh halini paylaştığında | 30 günlük mood streak |
| 🌌 Soulmate Sync | Tüm seviyeleri tamamladığında | Maksimum seviyeye ulaş |

## 📈 4. API Endpoints

### Kullanıcı Seviyesi
- `GET /api/level/user` - Kullanıcının mevcut seviyesini getir
- `GET /api/level/user/stats` - Detaylı seviye istatistikleri

### Rozetler
- `GET /api/achievements/user` - Kullanıcının rozetlerini getir

### Puan Sistemi
- `POST /api/level/add-points` - Kullanıcıya puan ekle

### Liderlik Tablosu
- `GET /api/leaderboard?type=all_time&limit=50` - Liderlik tablosu

## 🚀 5. Kurulum ve Başlatma

### 1. Veritabanı Modellerini Oluştur
```bash
# Modeller otomatik olarak oluşturulacak
```

### 2. Rozetleri Başlat
```bash
# Rozetleri veritabanına ekle
npm run init-achievements
```

### 3. API'yi Test Et
```bash
# Sunucuyu başlat
npm start
```

## 💡 6. Kullanım Örnekleri

### Günlük Not Ekleme (Otomatik Puan)
```javascript
// createJournal.ts içinde otomatik olarak çalışır
const pointsResult = await LovePointsService.addPoints(
  userId, 
  "daily_note", 
  { journalId: journal._id, mood: mood }
);
```

### Fotoğraf Yükleme (Otomatik Puan)
```javascript
// uploadPhoto.ts içinde otomatik olarak çalışır
const pointsResult = await LovePointsService.addPoints(
  userId, 
  "photo_upload", 
  { photoId: savedPhoto._id, album: album }
);
```

### Manuel Puan Ekleme
```javascript
const response = await fetch('/api/level/add-points', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'challenge_complete',
    points: 30,
    metadata: { challengeId: 'valentine_challenge' }
  })
});
```

## 🎨 7. Frontend Entegrasyonu

### Seviye Bilgilerini Getir
```javascript
const getUserLevel = async () => {
  const response = await fetch('/api/level/user', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Rozetleri Getir
```javascript
const getUserAchievements = async () => {
  const response = await fetch('/api/achievements/user', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Liderlik Tablosu
```javascript
const getLeaderboard = async (type = 'all_time') => {
  const response = await fetch(`/api/leaderboard?type=${type}&limit=50`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 🔧 8. Geliştirici Notları

### Yeni Aksiyon Ekleme
1. `LOVE_POINTS_ACTIONS` dizisine yeni aksiyon ekle
2. İlgili controller'da `LovePointsService.addPoints()` çağrısı ekle
3. Gerekirse yeni rozet oluştur

### Yeni Rozet Ekleme
1. `PREDEFINED_ACHIEVEMENTS` dizisine yeni rozet ekle
2. `LovePointsService.checkAndUnlockAchievements()` metodunu güncelle

### Haftalık/Aylık Sıfırlama
```javascript
// Haftalık puanları sıfırla
await LovePointsService.resetWeeklyPoints();

// Aylık puanları sıfırla
await LovePointsService.resetMonthlyPoints();
```

## 🎯 9. Gelecek Özellikler

- 🪩 **Couple Level**: İki partnerin ortak puanı
- 🎁 **Love Rewards**: Belirli seviyelerde özel temalar
- ⏳ **Seasonal Events**: Özel etkinlikler ve bonus puanlar
- 💠 **Leaderboard**: İlişki süresine göre sıralama

## 📊 10. İstatistikler

Sistem aşağıdaki istatistikleri takip eder:
- Toplam puan
- Haftalık puan
- Aylık puan
- Streak günleri
- Toplam aktivite sayısı
- Rozet ilerlemesi
- Seviye geçmişi

---

**LoveSync Gamification System** ile aşk yolculuğunuzu daha eğlenceli ve anlamlı hale getirin! 💕

