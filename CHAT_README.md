# Chat Sistemi - Kullanım Kılavuzu

Bu chat sistemi, kullanıcılar ve partnerleri arasında canlı mesajlaşma özelliği sağlar. Sistem Socket.IO kullanarak gerçek zamanlı iletişim kurar ve çevrimiçi durumu takip eder. Sistem retry mekanizması ve detaylı loglama ile güvenilir performans sağlar.

## Özellikler

### 🔥 Canlı Mesajlaşma
- Gerçek zamanlı mesaj gönderme ve alma
- Socket.IO ile anlık iletişim
- Mesaj okundu bildirimi
- Yazıyor... göstergesi

### 👥 Partner Sistemi
- Sadece partnerler arası mesajlaşma
- Partner doğrulama sistemi
- Güvenli iletişim

### 📱 Çevrimiçi Durumu
- Gerçek zamanlı çevrimiçi/çevrimdışı durumu
- Son görülme zamanı
- Partner çevrimiçi bildirimi

### 📨 Mesaj Türleri
- Metin mesajları
- Resim mesajları
- Ses mesajları
- Video mesajları
- Dosya mesajları

### 📊 Mesaj Yönetimi
- Mesaj geçmişi
- Okunmamış mesaj sayısı
- Mesaj silme
- Sayfalama desteği
- Retry mekanizması ile güvenilir mesaj gönderimi

## API Endpoints

### Mesaj İşlemleri

#### Mesaj Gönderme
```http
POST /chat/send-message
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "partner_user_id",
  "content": "Merhaba!",
  "messageType": "text",
  "mediaUrl": "https://example.com/image.jpg" // Opsiyonel
}
```

#### Mesajları Getirme
```http
GET /chat/messages/:partnerId?page=1&limit=50
Authorization: Bearer <token>
```

#### Mesaj Silme
```http
DELETE /chat/message/:messageId
Authorization: Bearer <token>
```

### Chat Room İşlemleri

#### Chat Room'ları Getirme
```http
GET /chat/chat-rooms
Authorization: Bearer <token>
```

### Çevrimiçi Durumu

#### Çevrimiçi Durumu Güncelleme
```http
PUT /chat/online-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isOnline": true,
  "socketId": "socket_id" // Opsiyonel
}
```

#### Partner Çevrimiçi Durumu
```http
GET /chat/partner-online-status
Authorization: Bearer <token>
```

## Socket.IO Events

### Client'tan Server'a

#### Mesaj Gönderme
```javascript
socket.emit('send_message', {
  receiverId: 'partner_user_id',
  content: 'Merhaba!',
  messageType: 'text',
  mediaUrl: 'https://example.com/image.jpg' // Opsiyonel
});
```

**Not:** Sistem otomatik olarak 3 deneme ile retry mekanizması kullanır. Mesaj gönderimi başarısız olursa sistem otomatik olarak tekrar dener.

#### Yazıyor Göstergesi
```javascript
// Yazmaya başladığında
socket.emit('typing_start', { receiverId: 'partner_user_id' });

// Yazmayı bıraktığında
socket.emit('typing_stop', { receiverId: 'partner_user_id' });
```

#### Mesaj Okundu
```javascript
socket.emit('mark_as_read', {
  messageIds: ['message_id_1', 'message_id_2'],
  chatRoomId: 'chat_room_id'
});
```

### Server'dan Client'a

#### Yeni Mesaj
```javascript
socket.on('new_message', (data) => {
  console.log('Yeni mesaj:', data.message);
  console.log('Chat room ID:', data.chatRoomId);
});
```

#### Mesaj Gönderildi (Onay)
```javascript
socket.on('message_sent', (data) => {
  console.log('Mesaj başarıyla gönderildi:', data.message);
});
```

#### Partner Çevrimiçi Durumu
```javascript
socket.on('partner_online', (data) => {
  console.log('Partner çevrimiçi durumu:', data.isOnline);
});
```

#### Partner Yazıyor
```javascript
socket.on('partner_typing', (data) => {
  console.log('Partner yazıyor:', data.isTyping);
});
```

#### Mesajlar Okundu
```javascript
socket.on('messages_read', (data) => {
  console.log('Mesajlar okundu:', data.messageIds);
});
```

## Kurulum

### 1. Dependencies Yükleme
```bash
npm install
```

### 2. Environment Variables
```env
JWT_KEY=your_jwt_secret_key
MONGO_URI=your_mongodb_connection_string
```

### 3. Veritabanı Modelleri
Sistem aşağıdaki MongoDB modellerini kullanır:
- `Message`: Mesaj bilgileri
- `ChatRoom`: Chat room bilgileri
- `OnlineStatus`: Çevrimiçi durumu
- `User`: Kullanıcı bilgileri (mevcut)

### 4. Socket.IO Bağlantısı
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});

socket.on('connect', () => {
  console.log('Socket.IO bağlantısı kuruldu');
});

socket.on('disconnect', () => {
  console.log('Socket.IO bağlantısı kesildi');
});

// Hata yönetimi
socket.on('error', (error) => {
  console.error('Socket hatası:', error.message);
});
```

## Güvenlik

### Partner Doğrulama
- Sadece partnerler arası mesajlaşma
- JWT token doğrulama
- Socket.IO authentication middleware

### Mesaj Güvenliği
- Mesaj içeriği doğrulama
- Dosya türü kontrolü
- Boyut sınırlamaları

## Performans

### Veritabanı Optimizasyonu
- Index'ler ile hızlı sorgular
- Sayfalama ile büyük veri yönetimi
- Lazy loading desteği
- maxTimeMS ile sorgu timeout'ları

### Socket.IO Optimizasyonu
- Room-based messaging
- Efficient event handling
- Connection pooling
- Retry mekanizması ile güvenilir mesajlaşma
- Exponential backoff ile akıllı retry stratejisi

## Hata Yönetimi

### API Hataları
```json
{
  "success": false,
  "message": "Hata açıklaması"
}
```

### Socket.IO Hataları
```javascript
socket.on('error', (error) => {
  console.error('Socket hatası:', error.message);
});
```

### Retry Mekanizması
Sistem otomatik olarak başarısız işlemleri tekrar dener:

- **Mesaj Gönderimi:** 3 deneme, exponential backoff
- **Online Status Güncelleme:** 3 deneme, exponential backoff
- **Veritabanı Sorguları:** maxTimeMS(5000) timeout

### Loglama
Sistem detaylı loglama yapar:
- 🔍 Socket authentication
- 📨 Message processing
- 🟢 Online status updates
- ❌ Error tracking
- ✅ Success confirmations

## Frontend Kullanım Kılavuzu

### React/React Native Örneği

#### 1. Temel Chat Component
```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('✅ Socket.IO bağlantısı kuruldu');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('❌ Socket.IO bağlantısı kesildi');
    });

    newSocket.on('new_message', (data) => {
      console.log('📨 Yeni mesaj alındı:', data.message);
      setMessages(prev => [...prev, data.message]);
    });

    newSocket.on('message_sent', (data) => {
      console.log('✅ Mesaj başarıyla gönderildi:', data.message);
    });

    newSocket.on('partner_online', (data) => {
      console.log('🟢 Partner çevrimiçi durumu:', data.isOnline);
      setIsPartnerOnline(data.isOnline);
    });

    newSocket.on('partner_typing', (data) => {
      console.log('⌨️ Partner yazıyor:', data.isTyping);
      setIsTyping(data.isTyping);
    });

    newSocket.on('messages_read', (data) => {
      console.log('📖 Mesajlar okundu:', data.messageIds);
      setMessages(prev => 
        prev.map(msg => 
          data.messageIds.includes(msg._id) 
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket hatası:', error.message);
      setConnectionStatus('error');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = (content) => {
    if (socket && currentPartner) {
      console.log('📤 Mesaj gönderiliyor:', content);
      socket.emit('send_message', {
        receiverId: currentPartner._id,
        content,
        messageType: 'text'
      });
    }
  };

  const startTyping = () => {
    if (socket && currentPartner) {
      socket.emit('typing_start', { receiverId: currentPartner._id });
    }
  };

  const stopTyping = () => {
    if (socket && currentPartner) {
      socket.emit('typing_stop', { receiverId: currentPartner._id });
    }
  };

  return (
    <div>
      <div className="connection-status">
        Bağlantı Durumu: {connectionStatus === 'connected' ? '🟢 Bağlı' : 
                          connectionStatus === 'error' ? '🔴 Hata' : '🔴 Bağlantı Yok'}
      </div>
      <div>Partner Çevrimiçi: {isPartnerOnline ? '🟢 Evet' : '🔴 Hayır'}</div>
      {isTyping && <div>⌨️ Partner yazıyor...</div>}
      <div>
        {messages.map(msg => (
          <div key={msg._id}>{msg.content}</div>
        ))}
      </div>
      <button onClick={() => sendMessage('Merhaba!')}>
        Mesaj Gönder
      </button>
    </div>
  );
};
```

#### 2. Chat Room Listesi Component
```javascript
const ChatRoomList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('/chat/chat-rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setChatRooms(data.data);
    } catch (error) {
      console.error('Chat room\'lar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      {chatRooms.map(room => (
        <div key={room._id} className="chat-room-item">
          <div className="partner-info">
            <img src={room.partner.profilePhoto} alt="Profile" />
            <div>
              <h3>{room.partner.name}</h3>
              <p>{room.partner.nickname}</p>
            </div>
          </div>
          <div className="last-message">
            <p>{room.lastMessage?.content}</p>
            <span>{new Date(room.lastMessageTime).toLocaleString()}</span>
          </div>
          {room.unreadCount > 0 && (
            <div className="unread-badge">{room.unreadCount}</div>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### 3. Mesaj Listesi Component
```javascript
const MessageList = ({ partnerId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMessages();
  }, [partnerId]);

  const fetchMessages = async (pageNum = 1) => {
    try {
      const response = await fetch(`/chat/messages/${partnerId}?page=${pageNum}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (pageNum === 1) {
        setMessages(data.data.messages);
      } else {
        setMessages(prev => [...data.data.messages, ...prev]);
      }
      
      setHasMore(data.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1);
    }
  };

  if (loading) return <div>Mesajlar yükleniyor...</div>;

  return (
    <div className="message-list">
      {hasMore && (
        <button onClick={loadMoreMessages}>Daha Fazla Mesaj Yükle</button>
      )}
      {messages.map(msg => (
        <div key={msg._id} className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
          <div className="message-content">
            {msg.messageType === 'text' && <p>{msg.content}</p>}
            {msg.messageType === 'image' && <img src={msg.mediaUrl} alt="Image" />}
            {msg.messageType === 'audio' && <audio controls src={msg.mediaUrl} />}
            {msg.messageType === 'video' && <video controls src={msg.mediaUrl} />}
            <span className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
            {msg.isRead && <span className="read-indicator">✓✓</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### 4. Mesaj Gönderme Component
```javascript
const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Typing timeout'u sıfırla
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 2 saniye sonra typing'i durdur
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      onTyping(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyPress={handleKeyPress}
        placeholder="Mesajınızı yazın..."
        rows={1}
      />
      <button onClick={handleSend}>Gönder</button>
    </div>
  );
};
```

#### 5. Online Status Component
```javascript
const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    updateOnlineStatus(true);
    
    // Sayfa kapatılırken offline yap
    const handleBeforeUnload = () => {
      updateOnlineStatus(false);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      updateOnlineStatus(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const updateOnlineStatus = async (status) => {
    try {
      await fetch('/chat/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOnline: status })
      });
    } catch (error) {
      console.error('Online status güncellenemedi:', error);
    }
  };

  const getPartnerStatus = async () => {
    try {
      const response = await fetch('/chat/partner-online-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setIsOnline(data.data.isOnline);
      setLastSeen(data.data.lastSeen);
    } catch (error) {
      console.error('Partner status alınamadı:', error);
    }
  };

  return (
    <div className="online-status">
      <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
      </div>
      {lastSeen && !isOnline && (
        <div className="last-seen">
          Son görülme: {new Date(lastSeen).toLocaleString()}
        </div>
      )}
    </div>
  );
};
```

#### 6. Ana Chat App Component
```javascript
const ChatApp = () => {
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleSendMessage = (content) => {
    if (socket && selectedPartner) {
      socket.emit('send_message', {
        receiverId: selectedPartner._id,
        content,
        messageType: 'text'
      });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && selectedPartner) {
      if (isTyping) {
        socket.emit('typing_start', { receiverId: selectedPartner._id });
      } else {
        socket.emit('typing_stop', { receiverId: selectedPartner._id });
      }
    }
  };

  return (
    <div className="chat-app">
      <div className="sidebar">
        <ChatRoomList onSelectPartner={setSelectedPartner} />
      </div>
      <div className="main-chat">
        {selectedPartner ? (
          <>
            <div className="chat-header">
              <h2>{selectedPartner.name}</h2>
              <OnlineStatus />
            </div>
            <MessageList partnerId={selectedPartner._id} />
            <MessageInput 
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="no-chat-selected">
            Sohbet etmek için bir partner seçin
          </div>
        )}
      </div>
    </div>
  );
};
```

### CSS Stilleri
```css
.chat-app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-status {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
}

.connection-status.connected {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.connection-status.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.connection-status.disconnected {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin-bottom: 10px;
  display: flex;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  position: relative;
}

.message.sent .message-content {
  background-color: #007bff;
  color: white;
}

.message.received .message-content {
  background-color: #f1f1f1;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.message-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.online {
  background-color: #28a745;
}

.status-indicator.offline {
  background-color: #dc3545;
}

.chat-room-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-room-item:hover {
  background-color: #f8f9fa;
}

.unread-badge {
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.typing-indicator {
  padding: 5px 10px;
  background-color: #f8f9fa;
  border-radius: 15px;
  font-style: italic;
  color: #6c757d;
  margin: 5px 0;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  border: 1px solid #c3e6cb;
}
```

## Sorun Giderme

### Yaygın Sorunlar

1. **Socket.IO Bağlantı Hatası**
   - JWT token'ın geçerli olduğundan emin olun
   - CORS ayarlarını kontrol edin
   - Console loglarını kontrol edin (🔍, ❌, ✅ emojileri)

2. **Mesaj Gönderilemiyor**
   - Partner ID'sinin doğru olduğunu kontrol edin
   - Kullanıcının partner olduğunu doğrulayın
   - Retry mekanizması loglarını kontrol edin

3. **Çevrimiçi Durumu Güncellenmiyor**
   - Socket.IO bağlantısını kontrol edin
   - OnlineStatus modelini kontrol edin
   - maxTimeMS timeout loglarını kontrol edin

4. **MongoDB Connection Timeout**
   - Connection pool ayarlarını kontrol edin
   - Retry mekanizması çalışıyor mu kontrol edin
   - Exponential backoff loglarını kontrol edin

### Debug İpuçları

Sistem detaylı loglama yapar. Console'da şu emojileri arayın:
- 🔍 Socket authentication
- 📨 Message processing
- 🟢 Online status updates
- ❌ Error tracking
- ✅ Success confirmations
- 🔄 Retry attempts
- 📝 Database operations

## Geliştirme

### Yeni Özellik Ekleme
1. Controller'da yeni fonksiyon oluşturun
2. Route'u tanımlayın
3. Socket.IO event'ini ekleyin
4. Retry mekanizması ekleyin (gerekirse)
5. Detaylı loglama ekleyin
6. Test edin

### Test Etme
```bash
# API testleri
npm test

# Socket.IO testleri
npm run test:socket

# Retry mekanizması testleri
# Console loglarını kontrol edin
```

### Loglama Standartları
Yeni özellikler eklerken şu loglama standartlarını kullanın:
- 🔍 Authentication/Validation
- 📨 Message processing
- 🟢 Success operations
- ❌ Error handling
- 🔄 Retry attempts
- 📝 Database operations

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 