# Expo Push Notifications Implementation

Bu dokümantasyon, auth-service'e eklenen Expo push notification sisteminin nasıl kullanılacağını açıklar.

## 🚀 Kurulum

### 1. Dependencies
```bash
npm install expo-server-sdk
```

### 2. Environment Variables
`.env` dosyanıza aşağıdaki environment variable'ı ekleyin:
```env
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

## 📱 Kullanım

### 1. Push Token Kaydetme
Kullanıcıların cihazlarından Expo push token'larını alıp kaydetmeleri gerekiyor.

**Endpoint:** `PUT /expo-push-token`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expo push token updated successfully",
  "data": {
    "userId": "user_id_here",
    "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  }
}
```

### 2. Test Notification Gönderme
Push notification sisteminin çalışıp çalışmadığını test etmek için:

**Endpoint:** `POST /test-notification`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "ticket": { /* Expo push ticket object */ },
    "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  }
}
```

## 🔔 Otomatik Notifications

Sistem aşağıdaki durumlarda otomatik olarak push notification gönderir:

### 1. Chat Mesajları
- Partner'dan yeni mesaj geldiğinde
- Socket.io ve REST API üzerinden gönderilen mesajlar için

### 2. Mood Güncellemeleri
- Partner ruh halini güncellediğinde
- `PUT /update-user-mood` endpoint'i kullanıldığında

### 3. Günlük Şarkı Paylaşımları
- Partner günlük şarkısını paylaştığında
- `POST /create-today-song` ve `POST /send-song` endpoint'leri kullanıldığında

## 🛠️ Notification Service API

### ExpoNotificationService Sınıfı

```typescript
import { expoNotificationService } from './services/expoNotificationService';

// Tek kullanıcıya notification gönder
await expoNotificationService.sendNotificationToUser(
  expoPushToken,
  {
    title: "Başlık",
    body: "Mesaj içeriği",
    data: { customData: "value" },
    sound: "default",
    badge: 1
  }
);

// Birden fazla kullanıcıya notification gönder
await expoNotificationService.sendNotificationToMultipleUsers(
  [expoPushToken1, expoPushToken2],
  {
    title: "Toplu Bildirim",
    body: "Bu herkese gönderilen bir bildirim"
  }
);

// Chat mesajı için özel notification
await expoNotificationService.sendChatNotification(
  expoPushToken,
  "Gönderen Adı",
  "Mesaj içeriği",
  "chatRoomId"
);

// Günlük şarkı için notification
await expoNotificationService.sendDailySongNotification(
  expoPushToken,
  "Partner Adı",
  "Şarkı Adı"
);

// Mood güncellemesi için notification
await expoNotificationService.sendMoodUpdateNotification(
  expoPushToken,
  "Partner Adı",
  "happy"
);

// Test notification
await expoNotificationService.sendTestNotification(expoPushToken);
```

## 📋 Database Schema

User modeline `expoPushToken` field'ı eklendi:

```typescript
interface UserAttrs {
  // ... diğer field'lar
  expoPushToken?: string;
}
```

## 🔧 Expo Client Tarafında Kurulum

### 1. Expo Notifications Kurulumu
```bash
npx expo install expo-notifications
```

### 2. Push Token Alma
```typescript
import * as Notifications from 'expo-notifications';

// Push token al
const getPushToken = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(token);
  
  // Token'ı server'a gönder
  await fetch('YOUR_API_URL/expo-push-token', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expoPushToken: token }),
  });
};
```

### 3. Notification Handler
```typescript
// Notification geldiğinde ne yapılacağını belirle
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification listener
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log(notification);
    // Notification geldiğinde yapılacak işlemler
  });

  return () => subscription.remove();
}, []);
```

## 🚨 Hata Yönetimi

- Notification gönderme işlemi başarısız olursa, ana işlem (mesaj gönderme, mood güncelleme vb.) etkilenmez
- Hatalar console'a loglanır
- Geçersiz push token'lar otomatik olarak filtrelenir

## 📝 Notlar

- Push notification'lar sadece partner'lar arasında gönderilir
- Kullanıcının `expoPushToken`'ı yoksa notification gönderilmez
- Test notification'ı sadece kendi token'ınızla test edebilirsiniz
- Notification'lar farklı channel ID'leri kullanır (chat_messages, mood_updates, daily_songs, ai_chat)

## 🔍 Debugging

Notification gönderme işlemlerini debug etmek için console loglarını takip edin:
- `Push notification sent for chat message`
- `Push notification sent for mood update`
- `Push notification sent for daily song`
- `Error sending push notification: [error details]`
